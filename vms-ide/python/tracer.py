import ctypes
import signal
import socket
import sys
import threading
import time
import os.path
import collections

# settings
class SETTINGS:
    HOST = '127.0.0.1'
    PORT = 54326
# messages to send
class MESSAGE:
    AMEND = 'AMEND'
    BP_CONFIRM = 'BP_CONFIRM'
    BP_RESET = 'BP_RESET'
    BP_WAIT = 'BP_WAIT'
    BREAK = 'BREAK'
    CONTINUED = 'CONTINUED'
    DEBUG = 'DEBUG'
    DEVELOPER = 'DEVELOPER'
    DISPLAY = 'DISPLAY'
    ENTRY = 'ENTRY'
    EXCEPTION = 'EXCEPTION'
    EXITED = 'EXITED'
    GOTO = 'GOTO'
    GOTO_TARGETS = 'GOTO_TARGETS'
    INFO = 'INFO'
    PAUSED = 'PAUSED'
    SIGNAL = 'SIGNAL'
    STEPPED = 'STEPPED'
    SYNTAX_ERROR = 'SYNTAX_ERROR'
    THREADS = 'THREADS'

# command to receive
class COMMAND:
    AMEND = 'a'             # a ident frame name value
    BP_RESET = 'bpr'        # bpr [file [line]]
    BP_SET = 'bps'          # bps file line
    CONTINUE = 'c'
    DISPLAY = 'd'           # d[h] [ident [frame [fullName [start [count]]]]]   // frame is zero-based
    FRAME  = 'f'            # f [ident [frameStart [frameNum]]]                 // frame is zero-based
    GOTO = 'g'              # g ident line
    GOTO_TARGETS = 'gt'     # gt file line  // test if we can go to target from current place
    INFO = 'i'
    MODE = 'm'              # m [0|1]       // user | developer 
    NEXT = 'n'              # n [ident]     // step over
    PAUSE = 'p'
    RETURN = 'r'            # r [ident]     // step out
    STEP = 's'              # s [ident]     // step in
    THREADS = 't'

class Tracer:
    def __init__(self, port, insensitive=False, developerMode=False):
        self._insensitive = insensitive
        self._developerMode = developerMode
        self._co_lnotab_signed = sys.version_info.major >= 3 and sys.version_info.minor >= 6
        self._knownValueTypes = [int, str, float, bool, complex, type(None)]
        self._port = port
        self._fileName = __file__
        self._socket = None
        self._sendBuffer = b''
        self._recvBuffer = b''
        self._oldSysTrace = None
        self._paused = False
        self._fileWaitingFor = None
        self._startTracing = False
        self._originalSigint = None
        self._originalSigbreak = None
        self._threads = {}                                          # thread enrties by [thread id]
        self._mainThread = None
        self._steppingThread = None
        self._steppingLevel = None
        self._breakpointsConfirmed = collections.defaultdict(set)   # confirmed break line list by [file name]
        self._breakpointsWait = collections.defaultdict(set)        # wait break line list by [file name]
        self._lines = collections.defaultdict(dict)                 # all usable line list by [file name [ function name ]]
        # self._files = set()
        # incapsulate functions from other classes
        self._lockTrace = threading.Lock()
        self._currentThread = threading.current_thread
        self._sleep = time.sleep
        self._setTrace = sys.settrace
        self._setThreadTrace = threading.settrace
        self._versionInfo = sys.version_info
        self._changeLocals = ctypes.pythonapi.PyFrame_LocalsToFast
        self._Obj = ctypes.py_object
        self._Int = ctypes.c_int
        self._os_path_basename = os.path.basename
        self._os_path_abspath = os.path.abspath
        self._setSignal = signal.signal
        self._messages = MESSAGE
        self._commands = COMMAND
        self._sig_int = signal.SIGINT
        # self._sig_break = signal.SIGBREAK
        self._sig_def = signal.SIG_DFL
        # DEBUG
        # self._enter_counter = 0

    def _setupTrace(self):
        self._setSignal(self._sig_int, self._signalHandler)
        # self._setSignal(self._sig_break, self._signalHandler)
        self._connect()
        self._oldSysTrace = sys.gettrace()
        self._setTrace(self._traceFunc)
        self._setThreadTrace(self._traceFunc)

    def _connect(self):
        self._open()
        self._sendDbgMessage(self._messages.DEBUG)

    def _disconnect(self):
        self._sendDbgMessage(self._messages.EXITED)
        self._close()

    def _open(self):
        self._socket = None
        try:
            self._socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self._socket.connect((SETTINGS.HOST, self._port))
            self._socket.setblocking(False)
        except:
            # print('Connect failed')
            self._socket = None
    
    def _close(self):
        try:
            self._socket.close()
        except:
            pass
        finally:
            self._socket = None

    def _cleanupTrace(self):
        self._setTrace(self._oldSysTrace)
        self._setThreadTrace(self._oldSysTrace)
        # self._setSignal(self._sig_break, self._sig_def)
        self._setSignal(self._sig_int, self._sig_def)
        self._disconnect()

    def _signalHandler(self, signum, frame):
        self._sendDbgMessage(self._messages.SIGNAL + ':' + str(signum))
        self._paused = True
    
    def _isConnected(self):
        return bool(self._socket)

    def _sendDbgMessage(self, message):
        """ Also add EOL at the end of message """
        self._sendBuffer += message.encode()
        self._sendBuffer += b'\n'
        if self._isConnected():
            try:
                sent = self._socket.send(self._sendBuffer)
                self._sendBuffer = self._sendBuffer[sent:]
            except Exception as ex:
                if isinstance(ex, IOError):
                    errno = ex.errno % 1000
                    if errno != 35:
                        self._close()
                else:
                    self._close()
            except:
                self._close()

    def _readDbgMessage(self):
        if self._isConnected():
            try:
                data = self._socket.recv(4096)
                if data:
                    self._recvBuffer += data
                else:
                    self._close()
            except Exception as ex:
                if isinstance(ex, IOError):
                    errno = ex.errno % 1000
                    if errno != 35:
                        self._close()
                else:
                    self._close()
            except:
                self._close()
            if self._recvBuffer:
                idx = self._recvBuffer.find(b'\n')
                if idx >= 0:
                    line = self._recvBuffer[:idx].decode()
                    self._recvBuffer = self._recvBuffer[idx+1:]
                    return line
        return None

    def _traceFunc(self, frame, event, arg):
        """ Do not forget not sending any data without locking (but ENTRY) """

        # self._enter_counter = self._enter_counter + 1

        # wait until tracing enabled
        if not self._startTracing:
            if not self._fileWaitingFor:
                return None
            return self._traceFunc

        currentFile = self.canonizeFile(frame.f_code.co_filename)
        # if not currentFile in self._files:
        #     self._files.add(currentFile)
            # self._sendDbgMessage('NEW FILE: %s' % currentFile)

        # skip this file
        if currentFile == self._fileName:
            if not self._fileWaitingFor:
                return None
            return self._traceFunc

        # skip system files
        # if self._os_path_abspath(currentFile) == currentFile:
        #     if not self._fileWaitingFor:
        #         return None
        #     return self._traceFunc
        if not self._developerMode and currentFile.startswith("/"):
            if not self._fileWaitingFor:
                return None
            return self._traceFunc

        # skip no files
        # if currentFile == '<string>':
        #     if not self._fileWaitingFor:
        #         return None
        #     return self._traceFunc
        if not self._developerMode and currentFile.startswith('<'):
            if not self._fileWaitingFor:
                return None
            return self._traceFunc

        # wait untin tracing file entered
        if self._fileWaitingFor:
            if self._fileWaitingFor != currentFile:
                return self._traceFunc
            # now we are ready to trace
            self._fileWaitingFor = None
            # autopause
            self._sendDbgMessage(self._messages.ENTRY)
            self._paused = True
        
        # take an ident
        ident = self._currentThread().ident
        if self._mainThread == None: 
            self._mainThread = ident
        
        # create current entry
        entry = {'ident': ident, 'frame': frame, 'event': event, 'arg': arg, 'paused': True, 'level': 0, 'exception': None, 'traceback': None }
        if ident in self._threads:
            # get previous entry information from dictionary
            entry['level'] = self._threads[ident]['level']
            entry['exception'] = self._threads[ident]['exception']
            entry['traceback'] = self._threads[ident]['traceback']
        # save entry to dictionary
        self._threads[ident] = entry

        # frame level tracking
        if event == 'call':
            entry['level'] = entry['level'] + 1
        if event == 'return':
            entry['level'] = entry['level'] - 1

        # clear exception info if it is already handled
        if event not in ['exception', 'return']:
            entry['exception'] = None
            entry['traceback'] = None

        with self._lockTrace:
            # point of tracing
            if event == 'call':
                # test if that function not in list
                code_name = frame.f_code.co_name + ":" + str(frame.f_lineno)
                code_lines = self._linesByFile(currentFile)
                if code_name not in code_lines:
                    # collect usable code lines
                    lines = []
                    lineno = frame.f_lineno
                    lines.append(lineno)
                    tail = frame.f_code.co_lnotab
                    while tail:
                        _, line_incr, *tail = tail
                        if line_incr:
                            if isinstance(line_incr, str):
                                line_incr = ord(line_incr)
                            if self._co_lnotab_signed:
                                if line_incr > 127:
                                    line_incr = line_incr - 256
                            lineno += line_incr
                            lines.append(lineno)
                    code_lines[code_name] = sorted(lines)
                    self._checkFileBreakpoints(currentFile, lines)
                    # self._sendDbgMessage('NEW FRAME: %s %s %s' % (currentFile, frame.f_code.co_name, repr(lines)))

            # examine exception and save it
            if event == 'exception':
                entry['exception'] = arg[1]
                entry['traceback'] = arg[2]
                # for testing purpose => always stop
                # self._sendDbgMessage(self._messages.EXCEPTION + ' ' + repr(entry['exception']))
                # self._paused = True

            # pause on unhandled exception
            if entry['exception'] != None and entry['level'] <= 0:
                self._sendDbgMessage(self._messages.EXCEPTION + ' ' + repr(entry['exception']))
                self._paused = True

            # examine breakpoint
            bp_file = currentFile.lower() if self._insensitive else currentFile
            if not self._paused and frame.f_lineno in self._breakpointsConfirmed[bp_file]:
                self._sendDbgMessage(self._messages.BREAK)
                # self._sendDbgMessage('_COUNTER_ ' + repr(self._enter_counter) + '\n')
                self._paused = True

            # tests runtime commands
            cmd = self._readDbgMessage()
            while cmd:
                if cmd == self._commands.PAUSE:
                    if not self._paused:
                        self._sendDbgMessage(self._messages.PAUSED)
                        # self._sendDbgMessage('_COUNTER_ ' + repr(self._enter_counter) + '\n')
                    self._paused = True
                elif cmd == self._commands.INFO:
                    self._showInfo(ident)
                # breakpoints
                elif cmd.startswith(self._commands.BP_SET):
                    self._doSetBreakPoint(cmd)
                elif cmd.startswith(self._commands.BP_RESET):
                    self._doResetBreakPoint(cmd)
                cmd = self._readDbgMessage()

            # test stepping
            if not self._paused and self._steppingThread == ident and (self._steppingLevel == None or self._steppingLevel == entry['level'] and event != 'return'):
                self._steppingThread = None
                self._steppingLevel = None
                self._paused = True
                self._sendDbgMessage(self._messages.STEPPED)
                # self._sendDbgMessage('_COUNTER_ ' + repr(self._enter_counter) + '\n')

            # pause loop
            while self._paused and self._isConnected():
                if cmd:
                    # continue
                    if cmd == self._commands.CONTINUE:
                        self._doContinue()
                        break   # break pause loop
                    # step
                    elif cmd.startswith(self._commands.STEP) or cmd.startswith(self._commands.NEXT) or cmd.startswith(self._commands.RETURN):
                        self._doStepping(cmd, ident, entry)
                        break   # break pause loop
                    # show threads
                    elif cmd == self._commands.THREADS:
                        self._showThreads(ident)
                    # change variable
                    elif cmd.startswith(self._commands.AMEND):
                        self._doAmend(cmd)
                    # show frames
                    elif cmd.startswith(self._commands.FRAME):
                        self._doFrames(cmd, ident)
                    # display variable
                    elif cmd.startswith(self._commands.DISPLAY):
                        self._doDisplay(cmd, ident)
                    # information (unused)
                    elif cmd == self._commands.INFO:
                        self._showInfo(ident)
                    # breakpoints
                    elif cmd.startswith(self._commands.BP_SET):
                        self._doSetBreakPoint(cmd)
                    elif cmd.startswith(self._commands.BP_RESET):
                        self._doResetBreakPoint(cmd)
                    elif cmd.startswith(self._commands.GOTO_TARGETS):
                        self._doGotoTargets(cmd, ident)
                    elif cmd.startswith(self._commands.GOTO):
                        self._doGoto(cmd)
                    elif cmd.startswith(self._commands.MODE):
                        self._doMode(cmd)
                # wait and read command again
                self._sleep(0.3)
                cmd = self._readDbgMessage()
            # ---------------------------------------------
        entry['paused'] = False
        if entry['level'] <= 0:
            # last line in this thread
            del self._threads[ident]
            if entry['exception'] != None:
                # unhandled exception
                if ident == self._mainThread:
                    self._sendDbgMessage(self._messages.EXITED)
                raise SystemExit()
        return self._traceFunc
    
    def canonizeFile(self, fileName):
        if fileName.startswith('./'):
            return fileName[2:]
        return fileName
    
    def _doGoto(self, cmd):
        locals_args = cmd.split()
        try:
            ident = int(locals_args[1])
            nextLine = int(locals_args[2])
            currFrame, isPostMortem = self._getFrame(ident, 0)
            isPostMortem = isPostMortem
            if currFrame != None:
                currFrame.f_lineno = nextLine
                self._sendDbgMessage('%s %s' % (self._messages.GOTO, 'ok'))
                # self._doStepping('s %i' % ident, ident, self._threads[ident])
        except Exception as ex:
            self._sendDbgMessage('%s %s %s' % (self._messages.GOTO, 'failed', repr(ex)))
    
    def _doGotoTargets(self, cmd, ident):
        locals_args = cmd.split()
        try:
            frame = self._threads[ident]['frame']
            code_file = self.canonizeFile(frame.f_code.co_filename)
            gotoFile = locals_args[1]
            if self._insensitive:
                gotoFile = gotoFile.lower()
                code_file = code_file.lower()
            if code_file == gotoFile:
                gotoLine = int(locals_args[2])
                currentLine = frame.f_lineno
                for _, code_lines in self._linesByFile(gotoFile).items():
                    if currentLine in code_lines and gotoLine in code_lines:
                        self._sendDbgMessage('%s ok' % self._messages.GOTO_TARGETS)
                        return
        except Exception as ex:
            self._sendDbgMessage('%s failed %s' % (self._messages.GOTO_TARGETS, repr(ex)))
            return
        self._sendDbgMessage('%s failed' % self._messages.GOTO_TARGETS)

    def _doDisplay(self, cmd, ident):
        locals_args = cmd.split()
        if len(locals_args) == 1:
            self._display(ident, 0, '.', None, None, locals_args[0].endswith('h'))
        elif len(locals_args) == 2:
            self._display(int(locals_args[1]), 0, '.', None, None, locals_args[0].endswith('h'))
        elif len(locals_args) == 3:
            self._display(int(locals_args[1]), int(locals_args[2]), '.', None, None, locals_args[0].endswith('h'))
        elif len(locals_args) == 4:
            self._display(int(locals_args[1]), int(locals_args[2]), locals_args[3], None, None, locals_args[0].endswith('h'))
        elif len(locals_args) == 5:
            self._display(int(locals_args[1]), int(locals_args[2]), locals_args[3], int(locals_args[4]), None, locals_args[0].endswith('h'))
        elif len(locals_args) == 6:
            self._display(int(locals_args[1]), int(locals_args[2]), locals_args[3], int(locals_args[4]), int(locals_args[5]), locals_args[0].endswith('h'))

    def _doFrames(self, cmd, ident):
        locals_args = cmd.split()
        if len(locals_args) == 1:
            self._showFrame(ident, None, None)                          # all frames in current ident
        elif len(locals_args) == 2:
            self._showFrame(int(locals_args[1]), None, None)            # all frames in given ident
        elif len(locals_args) == 3:
            self._showFrame(int(locals_args[1]), int(locals_args[2]), 1) # one given frame in given ident
        elif len(locals_args) == 4:
            self._showFrame(int(locals_args[1]), int(locals_args[2]), int(locals_args[3])) # given amount of frames starting given frame in given ident
    
    def _doAmend(self, cmd):
        sep = ' '
        cmd, sep, tail = cmd.partition(sep)
        aIdent, sep, tail = tail.partition(sep)
        aFrame, sep, tail = tail.partition(sep)
        aName, sep, aValue = tail.partition(sep)
        self._amend(int(aIdent), int(aFrame), aName, aValue)
    
    def _doContinue(self):
        if self._paused:
            self._sendDbgMessage(self._messages.CONTINUED)
        self._paused = False
        self._steppingThread = None
        self._steppingLevel = None

    def _doStepping(self, cmd, ident, entry):
        locals_args = cmd.split()
        if len(locals_args) == 1:
            self._steppingThread = ident
        elif len(locals_args) == 2:
            self._steppingThread = int(locals_args[1])
        self._steppingLevel = None
        if cmd.startswith(self._commands.NEXT):
            self._steppingLevel = entry['level']
        elif cmd.startswith(self._commands.RETURN):
            self._steppingLevel = entry['level'] - 1
        self._paused = False
        self._sendDbgMessage(self._messages.CONTINUED)

    def _doMode(self, cmd):
        locals_args = cmd.split()
        if len(locals_args) == 1:
            self._developerMode = False
        elif len(locals_args) == 2:
            self._developerMode = str(locals_args[1]).lower() in ['true', '1', 't', 'y', 'yes', 'yeah', 'yup', 'certainly', 'uh-huh']
        self._sendDbgMessage(self._messages.DEVELOPER + ' ' + str(self._developerMode))

    def _numFrames(self, entry):
        numFrames = 0
        if entry['traceback'] == None or entry['level'] > 0:
            frame = entry['frame']
            while frame:
                if self._isDebuggerFrame(frame):
                    frame = None
                    break
                numFrames = numFrames + 1
                frame = frame.f_back
        else:
            trace = entry['traceback']
            while trace:
                numFrames = numFrames + 1
                trace = trace.tb_next
        return numFrames

    def _showInfo(self, ident):
        self._sendDbgMessage(self._messages.INFO)
        self._sendDbgMessage('Main: %i' % self._mainThread)
        self._sendDbgMessage('Where: %i' % ident)
        self._sendDbgMessage('Threads: %i' % len(self._threads))
        for threadEntry in self._threads.values():
            if threadEntry['exception'] != None and threadEntry['level'] <= 0:
                # post-mortem info
                self._sendDbgMessage('  thread %i unhandled exception:' % threadEntry['ident'])
            else:
                # runing info
                self._sendDbgMessage('  thread %i frames %i %s:' % ( 
                        threadEntry['ident'],
                        self._numFrames(threadEntry),
                        'paused' if threadEntry['paused'] else 'running' ))
                self._sendDbgMessage('    file: "%s"' % self.canonizeFile(threadEntry['frame'].f_code.co_filename))
                self._sendDbgMessage('    line: %i' % threadEntry['frame'].f_lineno)
                self._sendDbgMessage('    function: "%s"' % threadEntry['frame'].f_code.co_name)

    def _getFrame(self, ident, frameNum):
        for entry in self._threads.values():
            if entry['ident'] != ident:
                continue
            if entry['traceback'] == None or entry['level'] > 0:
                currentFrame = entry['frame']
                currentFrameNum = 0
                while frameNum != currentFrameNum and currentFrame:
                    if self._isDebuggerFrame(currentFrame):
                        currentFrame = None
                        break
                    currentFrameNum = currentFrameNum + 1
                    currentFrame = currentFrame.f_back
                # check if given frame isn't debugger frame
                if self._isDebuggerFrame(currentFrame):
                    currentFrame = None
                if currentFrame == None:
                    self._sendDbgMessage('%s: %s has no frame %s' % (self._messages.SYNTAX_ERROR, ident, frameNum))
                    return (None, False)
                else:
                    return (currentFrame, False)
                break
            else:
                frames = []
                trace = entry['traceback']
                while trace:
                    frames.append(trace.tb_frame)
                    trace = trace.tb_next
                if len(frames) > frameNum:
                    return (frames[len(frames) - frameNum - 1], True)
        else:
            self._sendDbgMessage('%s: invalid ident %s' % (self._messages.SYNTAX_ERROR, ident))
        return (None, False)

    def _amend(self, ident, frameNum, name, value):
        frame, isPostMortem = self._getFrame(ident, frameNum)
        if isPostMortem:
            self._sendDbgMessage('%s failed Cannot amend post-mortem frames' % self._messages.AMEND)
            return
        if frame != None:
            try:
                if name in frame.f_locals:
                    self._changeLocalVar(frame, name, eval(value))
                else:
                    statement = '%s = %s' % (name, value)
                    exec(statement, {}, frame.f_locals)
                result = eval('%s' % name, {}, frame.f_locals)
                self._sendDbgMessage('%s ok %s' % (self._messages.AMEND, repr(result)))
                return
            except Exception as ex:
                self._sendDbgMessage('%s failed %s' % (self._messages.AMEND, str(ex)))
                return
        self._sendDbgMessage('%s failed Invalid frame' % self._messages.AMEND)

    def _display(self, ident, frameNum, fullName, start, count, showHex):
        frame, isPostMortem = self._getFrame(ident, frameNum)
        isPostMortem = isPostMortem
        if frame != None:
            try:
                if fullName.endswith('.'):
                    displayChildren = True
                    fullName = fullName[:-1]
                    displayName = fullName
                else:
                    displayChildren = False
                    displayName = fullName.rpartition('.')[2]
                if fullName:
                    # we have a name - get its value
                    result = eval(fullName, {}, frame.f_locals)
                    resultType = type(result)
                    if resultType in self._knownValueTypes:
                        # if we know that is valueType, display it
                        if resultType == int and showHex:
                            self._sendDbgMessage('%s "%s" %s value: %s' % (self._messages.DISPLAY, displayName, resultType, hex(result)))
                        else:
                            self._sendDbgMessage('%s "%s" %s value: %s' % (self._messages.DISPLAY, displayName, resultType, repr(result)))
                        return
                    else:
                        try:
                            # in first try to get length of value (test if it is enumerable)
                            length = len(result)
                            # we have a length, so test given start and count
                            if start != None:
                                # go through indexed children
                                if start < length:
                                    if count == None or start + count > length:
                                        count = length - start
                                    self._sendDbgMessage('%s "%s" %s length: %s' % (self._messages.DISPLAY, displayName, resultType, count))
                                    # enumerate through, cutting displayName
                                    displayName = fullName.rpartition('.')[2]
                                    enumerated = enumerate(iter(result))
                                    for x in enumerated:
                                        if start > 0:
                                            # wait a start
                                            start = start - 1
                                            continue
                                        if count > 0:
                                            # until count
                                            idx, value = x
                                            if type(result) == dict:
                                                idx = repr(value)
                                                value = result[value]
                                            resultType = type(value)
                                            if resultType in self._knownValueTypes:
                                                if resultType == int and showHex:
                                                    self._sendDbgMessage('%s "%s" %s value: %s' % (self._messages.DISPLAY, displayName + ('[%s]' % idx), resultType, hex(value)))
                                                else:
                                                    self._sendDbgMessage('%s "%s" %s value: %s' % (self._messages.DISPLAY, displayName + ('[%s]' % idx), resultType, repr(value)))
                                            else:
                                                try:
                                                    length = len(value)
                                                    self._sendDbgMessage('%s "%s" %s length: %s' % (self._messages.DISPLAY, displayName + ('[%s]' % idx), resultType, length))
                                                except:
                                                    children = dir(value)
                                                    self._sendDbgMessage('%s "%s" %s children: %s' % (self._messages.DISPLAY, displayName + ('[%s]' % idx), resultType, len(children)))
                                            count = count - 1
                                        else:
                                            break
                                    # enumerated all
                                    return
                                else:
                                    # have no corresponding children
                                    self._sendDbgMessage('%s "%s" %s length: 0' % (self._messages.DISPLAY, displayName, resultType))
                                    return
                            else:
                                # no start, just return length of children
                                self._sendDbgMessage('%s "%s" %s length: %s' % (self._messages.DISPLAY, displayName, resultType, length))
                                return
                        except:
                            children = dir(result)
                else:
                    # localc
                    resultType = "<type '-locals-'>"
                    children = frame.f_locals
                    displayChildren = True
                # test if variable has at least children
                self._sendDbgMessage('%s "%s" %s children: %s' % (self._messages.DISPLAY, displayName, resultType, len(children)))
                if displayChildren:
                    for childName in children:
                        self._display(ident, frameNum, (fullName + '.' if fullName else '') + childName, None, None, showHex)
            except Exception as ex:
                self._sendDbgMessage('%s "%s" failed: %s' % (self._messages.DISPLAY, displayName, repr(ex)))

    def _isDebuggerFrame(self, frame):
        return frame and self.canonizeFile(frame.f_code.co_filename) == self._fileName and frame.f_code.co_name == "_runscript"

    def _showThreads(self, ident):
        self._sendDbgMessage(self._messages.THREADS + (' %i current %i' % (len(self._threads), ident)))
        for threadEntry in self._threads.values():
            self._sendDbgMessage('thread %i frames %i is %s' % (
                    threadEntry['ident'], 
                    self._numFrames(threadEntry),
                    'paused' if threadEntry['paused'] else 'running' ))
    
    def _showFrame(self, ident, frameStart, numFrames):
        if frameStart == None:
            frameStart = 0
        frame, isPostMortem = self._getFrame(ident, frameStart)
        frameNum = 0
        while frame != None and frameNum != numFrames:
            if self._isDebuggerFrame(frame):
                break
            self._sendDbgMessage('file: "%s" line: %i function: "%s" %s' % (self.canonizeFile(frame.f_code.co_filename), frame.f_lineno, frame.f_code.co_name, 'dead' if isPostMortem else 'alive' ))
            frameNum = frameNum + 1
            frame = frame.f_back

    def _checkFileBreakpoints(self, bp_file, lines):
        """ test all waiting breakpoints for file """
        unconfirmed = set()
        bp_file = bp_file.lower() if self._insensitive else bp_file
        for bp_line in self._breakpointsWait[bp_file]:
            if bp_line in lines:
                self._confirmBreakpoint(bp_file, bp_line, None)
            else:
                confirmed = False
                # if bp at the non-code line between adjacent real-code lines
                if bp_line > lines[0] and bp_line < lines[-1]:
                    for i in range(len(lines) - 1):
                        if bp_line < lines[i+1]:
                            if lines[i+1] - lines[i] < 3:
                                self._confirmBreakpoint(bp_file, bp_line, lines[i])
                                confirmed = True
                            break
                if not confirmed:
                    unconfirmed.add(bp_line)
        self._breakpointsWait[bp_file] = unconfirmed

    def _linesByFile(self, file):
        if self._insensitive and self._lines:
            file = file.lower()
            for key, value in self._lines.items():
                if key.lower() == file:
                    return value
        return self._lines[file]

    def _testBreakpoint(self, bp_file, bp_line):
        """ test breakpoint """
        for funcLines in self._linesByFile(bp_file).values():
            if bp_line in funcLines:
                return True
        return False
    
    def _confirmBreakpoint(self, bp_file, bp_line, bp_line_real):
        """ add to confirmed """
        if bp_line_real != None:
            self._sendDbgMessage(self._messages.BP_CONFIRM + (' "%s" %i %i' % (bp_file, bp_line, bp_line_real)))
            self._breakpointsConfirmed[bp_file].add(bp_line_real)
        else:
            self._sendDbgMessage(self._messages.BP_CONFIRM + (' "%s" %i' % (bp_file, bp_line)))
            self._breakpointsConfirmed[bp_file].add(bp_line)

    def _waitBreakpoint(self, bp_file, bp_line):
        """ add for waiting """
        self._sendDbgMessage(self._messages.BP_WAIT + (' "%s" %i' % (bp_file, bp_line)))
        self._breakpointsWait[bp_file].add(bp_line)
    
    def _doSetBreakPoint(self, cmd):
        try:
            cmd, bp_file, bp_line = cmd.split()
            self._setBp(bp_file, int(bp_line))
        except Exception as ex:
            self._sendDbgMessage(self._messages.EXCEPTION + ' ' + repr(ex))

    def _doResetBreakPoint(self, cmd):
        try:
            bp_args = cmd.split()
            if len(bp_args) == 1:
                self._resetBp(None, None)
            elif len(bp_args) == 2:
                cmd, bp_file = bp_args
                self._resetBp(bp_file, None)
            else:
                cmd, bp_file, bp_line = bp_args
                self._resetBp(bp_file, int(bp_line))
        except Exception as ex:
            self._sendDbgMessage(self._messages.EXCEPTION + ' ' + repr(ex))

    def _setBp(self, bp_file, bp_line):
        bp_file = bp_file.lower() if self._insensitive else bp_file
        if self._testBreakpoint(bp_file, bp_line):
            self._confirmBreakpoint(bp_file, bp_line, None)
        else:
            self._waitBreakpoint(bp_file, bp_line)

    def _resetBp(self, bp_file, bp_line):
        if bp_file:
            bp_file = bp_file.lower() if self._insensitive else bp_file
            if bp_line != None:
                self._breakpointsWait[bp_file].discard(bp_line)
                self._breakpointsConfirmed[bp_file].discard(bp_line)
                self._sendDbgMessage(self._messages.BP_RESET + (' "%s" %i' % (bp_file, bp_line)))
            else:
                del self._breakpointsWait[bp_file]
                del self._breakpointsConfirmed[bp_file]
                self._sendDbgMessage(self._messages.BP_RESET + (' "%s"' % bp_file))
        else:
            self._breakpointsWait.clear()
            self._breakpointsConfirmed.clear()
            self._sendDbgMessage(self._messages.BP_RESET)

    def _changeLocalVar(self, frame, varName, newValue):
        frame.f_locals.update({
            varName: newValue,
        })
        self._changeLocals(self._Obj(frame), self._Int(0))

    def _runscript(self, filename):
        sys.path.insert(0, '.')      # add cwd
        # === Given from PDB.PY ===
        import __main__
        builtinsT = __builtins__
        __main__.__dict__.clear()
        __main__.__dict__.update({'__name__'    : '__main__',
                                  '__file__'    : filename,
                                  '__builtins__': builtinsT,
                                 })
        self._fileWaitingFor = filename
        globalsT = __main__.__dict__
        try:
            # self._sendDbgMessage('PATH: %s' % repr(sys.path))
            with open(filename, 'rb') as fp:
                statement = "exec(compile(%r, %r, 'exec'))" % (fp.read(), filename)
            self._startTracing = True
            exec(statement, globalsT, globalsT)
        except Exception as ex:
            if self._isConnected():
                self._sendDbgMessage(self._messages.EXCEPTION + ' ' + repr(ex))
            else:
                print(repr(ex))
    
    def run(self, filename):
        self._setupTrace()
        self._runscript(filename)
        self._cleanupTrace()

#===================================================================

if __name__ == '__main__':

    _usage = """\
usage: tracer.py -p port [-d] [-i] pyfile [arg] ...

Debug the Python program given by pyfile."""

    import getopt

    opts, args = getopt.getopt(sys.argv[1:], 'hp:di', ['help','port='])

    if not args:
        print(_usage)
        sys.exit(2)

    developerMode = False
    insensitive = False

    for opt, optarg in opts:
        if opt in ['-h', '--help']:
            print(_usage)
            sys.exit()
        elif opt in ['-p', '--port']:
            SETTINGS.PORT = int(optarg)
        elif opt in ['-d']:
            developerMode = True
        elif opt in ['-i']:
            insensitive = True
        else:
            print('Unknown option %s' % opt)

    sys.argv = args

    tracer = Tracer(SETTINGS.PORT, developerMode=developerMode, insensitive=insensitive)
    tracer.run(args[0])
