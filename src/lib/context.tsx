import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {defaultState,readState,writeState,type AppState} from './storage';
interface Store {state:AppState;update:(fn:(s:AppState)=>AppState)=>void;notify:(message:string)=>void;ready:boolean}
const Context=createContext<Store>(null!);
export function StoreProvider({children}:{children:ReactNode}){
 const [state,setState]=useState(defaultState);const [ready,setReady]=useState(false);const [toast,setToast]=useState('');const timer=useRef<ReturnType<typeof setTimeout>|null>(null);const queue=useRef(Promise.resolve());
 const notify=(m:string)=>{setToast(m);if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>setToast(''),4500)};
 useEffect(()=>{readState().then(setState).catch(()=>notify('Device storage could not be opened. Changes may not be saved.')).finally(()=>setReady(true))},[]);
 useEffect(()=>{if(ready)queue.current=queue.current.then(()=>writeState(state)).catch(()=>notify('Your device storage is full. Export a backup before removing photos.'))},[state,ready]);
 return <Context.Provider value={{state,update:setState,notify,ready}}>{children}{toast&&<div className="toast" role="status">{toast}</div>}</Context.Provider>
}
export const useStore=()=>useContext(Context);
