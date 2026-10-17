// Classic dedicated worker. Termination is the hard execution time limit.
importScripts('/pyodide/pyodide.js');
const ready = loadPyodide({indexURL:'/pyodide/'});
ready.then(()=>postMessage({type:'ready'})).catch(error=>postMessage({type:'init-error',error:String(error)}));
self.onmessage = async ({data}) => {
  try {
    const py = await ready;
    const globals = py.runPython('dict()');
    try {
      const json = await py.runPythonAsync(data.source, {globals});
      postMessage({type:'result',result:JSON.parse(json)});
    } finally { globals.destroy(); }
  } catch(error) { postMessage({type:'error',error:String(error)}); }
};
