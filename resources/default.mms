
! MMS - run with /EXTENDED_SYNTAX qualifier
.SILENT

! Debug or Release
.IF DEBUG
OUT_DIR = .$(OUTDIR).debug
CXXFLAGS = /DEBUG/NOOP/LIST=$(MMS$TARGET_NAME)/OBJECT=$(MMS$TARGET) 
CCFLAGS = /DEBUG/NOOP/LIST=$(MMS$TARGET_NAME)/OBJECT=$(MMS$TARGET) 
LINKFLAGS = /DEBUG/MAP=$(MMS$TARGET_NAME)/EXECUTABLE=$(MMS$TARGET)
.ELSE
OUT_DIR = .$(OUTDIR).release
CXXFLAGS = /OBJECT=$(MMS$TARGET) 
CCFLAGS = /OBJECT=$(MMS$TARGET) 
LINKFLAGS = /EXECUTABLE=$(MMS$TARGET)
.ENDIF

! Object directory
OBJ_DIR = $(OUT_DIR).obj

OBJECTS = $(JOIN $(PATSUBST *,[*],$(PATSUBST *[*],**,$(SUBST [],,$(ADDPREFIX $(OBJ_DIR),$(DIR $(SOURCES)))))),$(ADDSUFFIX .OBJ, $(NOTDIR $(BASENAME $(SOURCES)))))

.SUFFIXES
.SUFFIXES .EXE .OBJ .CPP .C

.CPP.OBJ
    @- pipe create/dir $(DIR $(MMS$TARGET)) | copy SYS$INPUT nl:
    $(CXX) $(CXXFLAGS) $(MMS$SOURCE)

.C.OBJ
    @- pipe create/dir $(DIR $(MMS$TARGET)) | copy SYS$INPUT nl:
    $(CC) $(CCFLAGS) $(MMS$SOURCE)

[$(OUT_DIR)]$(NAME).exe DEPENDS_ON $(OBJECTS)
    $(LINK) $(LINKFLAGS) $(MMS$SOURCE_LIST)

