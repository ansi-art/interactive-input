import { InteractiveInput } from './src/index.mjs';

const tracker = InteractiveInput.globalHandler({
    dumpUnknown: true
});

['keypress', 'mousemove', 'mouseup', 'mousedown'].forEach((type)=>{
    tracker.on(type, (event)=>{
        if(event.key === 'Escape'){
            setTimeout(()=>{
                tracker.stop();
                process.exit();
            }, 100);
        }
        console.log(type, event);
    });
});