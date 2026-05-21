import app from "../artifacts/api-server/src/app";

async function main() {
  console.log("Initial keys:", Object.keys(app));
  
  // Force router initialization by invoking handle
  const req = { url: '/dummy', method: 'GET', headers: {} };
  const res = { end: () => {}, setHeader: () => {}, on: () => {} };
  (app as any).handle(req, res, () => {});
  
  console.log("After handle - _router exists:", !!(app as any)._router);
  console.log("After handle - router exists:", !!(app as any).router);
  
  const routerObj = (app as any)._router || (app as any).router;
  if (routerObj && routerObj.stack) {
    console.log("Middleware stack names:");
    routerObj.stack.forEach((layer: any, idx: number) => {
      console.log(`[${idx}] name: ${layer.name || 'anonymous'}, regexp: ${layer.regexp}`);
    });
  } else {
    console.log("Could not find stack.");
  }
  process.exit(0);
}

main().catch(console.error);
