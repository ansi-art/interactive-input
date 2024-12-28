/*
import { isBrowser, isJsDom } from 'browser-or-node';
import * as mod from 'module';
import * as path from 'path';
let internalRequire = null;
if(typeof require !== 'undefined') internalRequire = require;
const ensureRequire = ()=> (!internalRequire) && (internalRequire = mod.createRequire(import.meta.url));
//*/

/**
 * A JSON object
 * @typedef { object } JSON
 */
//const dec2bin = (dec)=>{ return (dec >>> 0).toString(2); };
 
import { Emitter } from 'extended-emitter';

export class InteractiveInput{
    constructor(options={}){
        this.options = options;
        this.captureMouseEvents = false;
        (new Emitter()).onto(this);
    }
    
    //returns false if not consumed
    consume(event){
        let keyName = getKeyName(event.data);
        event.name = keyName;
        if(
            this.captureMouseEvents &&
            event.data.length === 6 &&
            event.data[0] === 27 &&
            event.data[1] === 91 &&
            event.data[2] === 77
        ){
            //mousemove
            let type = null;
            switch(event.data[3]){
                case 67 : type = 'mousemove'; break;
                case 34 : type = 'mousedown'; break;
                case 35 : type = 'mouseup'; break;
            }
            const outputEvent = { //offset by 32 then -1 for 0 indexed
                //value: dec2bin(event.data[3]),
                ctrlKey: !!(event.data[3] & 0b0010000),
                optionKey: !!(event.data[3] & 0b0001000),
                metaKey: false, //no access
                altKey: !!(event.data[3] & 0b0001000),
                shiftKey: !!(event.data[3] & 0b0000100),
                button: '',
                buttons: [],
                //relatedTarget
                pageX: event.data[4]-33,
                pageY: event.data[5]-33
            };
            this.emit(type, outputEvent);
        }else{
            if(event.name){
                const outputEvent = { //offset by 32 then -1 for 0 indexed
                    //value: dec2bin(event.data[3]),
                    ctrlKey: !!(event.data[3] & 0b0010000),
                    optionKey: !!(event.data[3] & 0b0001000),
                    metaKey: false, //no access
                    altKey: !!(event.data[3] & 0b0001000),
                    shiftKey: !!(event.data[3] & 0b0000100),
                    key: event.name,
                    code: event.name.charCodeAt(0)
                };
                this.emit('keypress', outputEvent);
                //console.log(event);
            }else{
                if(
                    event.data.length === 1 &&
                    event.data[0] < 27
                ){
                    const char = String.fromCharCode(event.data[0] + 96);
                    const outputEvent = { //offset by 32 then -1 for 0 indexed
                        //value: dec2bin(event.data[3]),
                        ctrlKey: true,
                        optionKey: false,
                        metaKey: false, //no access
                        altKey: false,
                        shiftKey: false,
                        key: char,
                        code: char.charCodeAt(0)
                    };
                    this.emit('keypress', outputEvent);
                    console.log(event.data, String.fromCharCode(event.data[0] + 96));
                }else{
                    const optionsKey = getOptionName(event.data);
                    if(optionsKey){
                        const outputEvent = { //offset by 32 then -1 for 0 indexed
                            //value: dec2bin(event.data[3]),
                            ctrlKey: false,
                            optionKey: true,
                            metaKey: false, //no access
                            altKey: false,
                            shiftKey: false,
                            key: optionsKey,
                            code: optionsKey.charCodeAt(0)
                        };
                        this.emit('keypress', outputEvent);
                    }else{
                        if(this.options.dumpUnknown){
                            console.log(event);
                        }
                    }
                }
            }
        }
    }
    
    start(){
        this.captureMouseEvents = true;
        process.stdout.write('\x1B[?1003h');
    }
    
    stop(){
        process.stdout.write('\x1B[?1003l');
        this.captureMouseEvents = false;
    }
}

InteractiveInput.globalHandler = (options={})=>{
    const tracker = new InteractiveInput(options);
    tracker.start();
    process.stdin.setRawMode(true);
    process.stdin.on('data', (buffer) => {
        tracker.consume(buffer.toJSON());
    });
    const gracefulTerminate = ()=>{ tracker.stop(); };
    process.on('SIGTERM', gracefulTerminate);
    process.on('SIGINT', gracefulTerminate);
    return tracker;
};

const Key = {
    Unknown  : '',
    
    // other Ascii
    Backspace  : 'Backspace',
    Tab  : 'Tab',
    Enter  : 'Enter',
    Escape  : 'Escape',
    Space  : 'Space',
    Delete  : 'Delete',
    
    // arrows
    ArrowUp  : 'ArrowUp',
    ArrowDown  : 'ArrowDown',
    ArrowRight  : 'ArrowRight',
    ArrowLeft  : 'ArrowLeft',
    
    // cursor position
    Home  : 'Home',
    Insert  : 'Insert',
    End  : 'End',
    PageUp  : 'PageUp',
    PageDown  : 'PageDown',
    
    // functional
    F1  : 'F1',
    F2  : 'F2',
    F3  : 'F3',
    F4  : 'F4',
    F5  : 'F5',
    F6  : 'F6',
    F7  : 'F7',
    F8  : 'F8',
    F9  : 'F9',
    F10  : 'F10',
    F11  : 'F11',
    F12  : 'F12'
};

const keyMap = [
    // other ASCII
    { data: [[8], [127]], keyName: Key.Backspace }, // ssh connection via putty generates 127 for Backspace - weird...
    { data: [[9]], keyName: Key.Tab },
    { data: [[13]], keyName: Key.Enter },
    { data: [[27]], keyName: Key.Escape },
    { data: [[32]], keyName: Key.Space },
    { data: [[27, 91, 51, 126]], keyName: Key.Delete },
    // arrows
    { data: [[27, 91, 65]], keyName: Key.ArrowUp },
    { data: [[27, 91, 66]], keyName: Key.ArrowDown },
    { data: [[27, 91, 67]], keyName: Key.ArrowRight },
    { data: [[27, 91, 68]], keyName: Key.ArrowLeft },
    // cursor position
    { data: [[27, 91, 49, 126]], keyName: Key.Home },
    { data: [[27, 91, 50, 126]], keyName: Key.Insert },
    { data: [[27, 91, 52, 126]], keyName: Key.End },
    { data: [[27, 91, 53, 126]], keyName: Key.PageUp },
    { data: [[27, 91, 54, 126]], keyName: Key.PageDown },
    // functional
    { data: [[27, 91, 91, 65], [27, 91, 49, 49, 126]], keyName: Key.F1 },
    { data: [[27, 91, 91, 66], [27, 91, 49, 50, 126]], keyName: Key.F2 },
    { data: [[27, 91, 91, 67], [27, 91, 49, 51, 126]], keyName: Key.F3 },
    { data: [[27, 91, 91, 68], [27, 91, 49, 52, 126]], keyName: Key.F4 },
    { data: [[27, 91, 91, 69], [27, 91, 49, 53, 126]], keyName: Key.F5 },
    { data: [[27, 91, 49, 55, 126]], keyName: Key.F6 },
    { data: [[27, 91, 49, 56, 126]], keyName: Key.F7 },
    { data: [[27, 91, 49, 57, 126]], keyName: Key.F8 },
    { data: [[27, 91, 50, 48, 126]], keyName: Key.F9 },
    { data: [[27, 91, 50, 49, 126]], keyName: Key.F10 },
    { data: [[27, 91, 50, 51, 126]], keyName: Key.F11 },
    { data: [[27, 91, 50, 52, 126]], keyName: Key.F12 }
];

const optionsMap = [
    // other ASCII
    { data: [[195, 165]], keyName: 'a' },
    { data: [[226, 136, 171]], keyName: 'b' },
    { data: [[195, 167]], keyName: 'c' },
    { data: [[226, 136, 130]], keyName: 'd' },
    { data: [[194, 180]], keyName: 'e' },
    { data: [[198, 146]], keyName: 'f' },
    { data: [[194, 169]], keyName: 'g' },
    { data: [[203, 153]], keyName: 'h' },
    { data: [[203, 134]], keyName: 'i' },
    { data: [[226, 136, 134]], keyName: 'j' },
    { data: [[203, 154]], keyName: 'k' },
    { data: [[194, 172]], keyName: 'l' },
    { data: [[194, 181]], keyName: 'm' },
    { data: [[203, 156]], keyName: 'n' },
    { data: [[195, 184]], keyName: 'o' },
    { data: [[207, 128]], keyName: 'p' },
    { data: [[197, 147]], keyName: 'q' },
    { data: [[194, 174]], keyName: 'r' },
    { data: [[195, 159]], keyName: 's' },
    { data: [[226, 128, 160]], keyName: 't' },
    { data: [[194, 168]], keyName: 'u' },
    { data: [[226, 136, 154]], keyName: 'v' },
    { data: [[226, 136, 145]], keyName: 'w' },
    { data: [[226, 137, 136]], keyName: 'x' },
    //{ data: [[8]], keyName: 'y' }, //overlaps with '//'
    { data: [[206, 169]], keyName: 'z' }
];

export const getKeyName = (data) => {
    let match;
    
    if (isSingleBytePrintableAscii(data)) {
        return String.fromCharCode(data[0]);
    }
    
    match = keyMap.filter((entry) => {
        const innerResult = entry.data.filter((subEntry) => subEntry.join(',') === data.join(','));
    
        return innerResult.length > 0;
    });
    
    if (match.length === 1) {
        return match[0].keyName;
    }
    
    return Key.Unknown;
};

export const getOptionName = (data) => {
    let match;
    
    if (isSingleBytePrintableAscii(data)) {
        return String.fromCharCode(data[0]);
    }
    
    match = optionsMap.filter((entry) => {
        const innerResult = entry.data.filter((subEntry) => subEntry.join(',') === data.join(','));
    
        return innerResult.length > 0;
    });
    
    if (match.length === 1) {
        return match[0].keyName;
    }
    
    return Key.Unknown;
};

const isSingleBytePrintableAscii = (data) => {
    // skip tilde as this is not the key available via single press
    return data.length === 1 &&
        '!'.charCodeAt(0) <= data[0] &&
        data[0] <= '}'.charCodeAt(0);
};