import { MouseTracker } from './src/index.mjs';

MouseTracker.globalHandler((event, tracker)=>{
    if(event.name === 'Escape'){
        setTimeout(()=>{
            tracker.stop();
            process.exit();
        }, 100);
    }
});