import { promises, createReadStream } from "node:fs";
import { createServer } from "node:http";
import { join, extname } from "node:path";

const PORT = 3000;

const MIME_TYPES = {
  default: "application/octet-stream",
  html: "text/html; charset=UTF-8",
  js: "application/javascript",
  css: "text/css",
  png: "image/png",
  jpg: "image/jpg",
  gif: "image/gif",
  ico: "image/x-icon",
  svg: "image/svg+xml",
};

const STATIC_PATH = join(process.cwd());

const toBool = [() => true, () => false];

const prepareFile = async (url) => {
  const paths = [STATIC_PATH, url];
  if (url.endsWith("/")) paths.push("index.html");

  const filePath = join(...paths);
  const pathTraversal = !filePath.startsWith(STATIC_PATH);
  const exists = await promises.access(filePath).then(...toBool);
  const found = !pathTraversal && exists;
  const streamPath = filePath;
  const ext = extname(streamPath).substring(1).toLowerCase();
  const stream = createReadStream(streamPath);
  return { found, ext, stream };
};

createServer(async (req, res) => {
  const file = await prepareFile(req.url);
  const statusCode = file.found ? 200 : 404;
  const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
  res.writeHead(statusCode, { "Content-Type": mimeType });
  file.stream.pipe(res);
  console.log(`${req.method} ${req.url} ${statusCode}`);
}).listen(PORT);

console.log(`Server running at http://localhost:${PORT}/`);
