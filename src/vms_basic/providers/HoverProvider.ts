import { HoverProvider, TextDocument, Position, CancellationToken, Hover } from "vscode";
import { Facade } from "../context/Facade";
import { symbolDescriptionFromEnum } from '../context/Symbol';
import { Basic } from '../extension';
import * as path from 'path';


export class BasicHoverProvider implements HoverProvider 
{
    constructor(private backend: Facade) { }

    public async provideHover(document: TextDocument, position: Position, token: CancellationToken)//: ProviderResult<Hover>
    {
        let positionInfo = "";
        let info = this.backend.symbolInfoAtPosition(document.fileName, position.character + 1, position.line + 1);
        
        if (!info) 
        {
            return undefined;
        }
        
        if(info.definition)
        {
            if (info.definition.range) 
            {
                positionInfo += ` at ${info.definition.range.start.row}:${info.definition.range.start.column}`;
            }
        }

        const description = symbolDescriptionFromEnum(info.kind);
        return new Hover([
            "**" + description + "**\ndefined in: " + path.basename(info.source) + positionInfo,
            { language: Basic.language, value: (info.dataInfo? info.dataInfo : "") }
        ]);
    }
}