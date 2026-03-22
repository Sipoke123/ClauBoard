// Custom server that runs Next.js standalone and proxies /ws to the API server
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next/dist/server/next-server").default;
const path = require("path");

const port = parseInt(process.env.PORT || "3000", 10);
const apiPort = parseInt(process.env.API_PORT || "3001", 10);

// Next.js standalone app
const app = new next({
  hostname: "0.0.0.0",
  port,
  dir: path.join(__dirname),
  dev: false,
  customServer: true,
  conf: require(path.join(__dirname, ".next/required-server-files.json")).config,
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res, parse(req.url || "/", true));
  });

  // Proxy WebSocket /ws upgrades to the API server
  server.on("upgrade", (req, socket, head) => {
    const { pathname } = parse(req.url || "/");
    if (pathname === "/ws") {
      const net = require("net");
      const proxy = net.connect(apiPort, "127.0.0.1", () => {
        proxy.write(
          `GET /ws HTTP/1.1\r\n` +
          `Host: 127.0.0.1:${apiPort}\r\n` +
          `Upgrade: websocket\r\n` +
          `Connection: Upgrade\r\n` +
          `Sec-WebSocket-Key: ${req.headers["sec-websocket-key"]}\r\n` +
          `Sec-WebSocket-Version: ${req.headers["sec-websocket-version"]}\r\n` +
          (req.headers["sec-websocket-protocol"] ? `Sec-WebSocket-Protocol: ${req.headers["sec-websocket-protocol"]}\r\n` : "") +
          `\r\n`
        );
        proxy.pipe(socket);
        socket.pipe(proxy);
      });
      proxy.on("error", () => socket.destroy());
      socket.on("error", () => proxy.destroy());
    } else {
      socket.destroy();
    }
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`[clauboard-web] listening on :${port} (API proxy → :${apiPort})`);
  });
});
