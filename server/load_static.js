import fs from 'fs';
import path from 'path';
import mime from 'mime';
import url from 'url';
// import { domain } from '../index.js';

const __dirname = import.meta.dirname;
const client_dir = path.resolve(__dirname, '../client');

export default function loadStatic(req, res) {
	const parsed_url = url.parse(req.url, true);
	const filePath = path.join(client_dir, parsed_url.pathname === '/' ? 'index.html' : parsed_url.pathname);
	let contentType = mime.getType(filePath) || 'text/html';

	fs.readFile(filePath, (err, content) => {
		if (err) {
			const errorPage = err.code === 'ENOENT' ? '404.html' : '500.html';
			const statusCode = err.code === 'ENOENT' ? 404 : 500;
			fs.readFile(path.join(client_dir, errorPage), (error, errorContent) => {
				res.writeHead(statusCode, {'Content-Type': 'text/html'});
				res.end(errorContent || `Server Error: ${err.code}`, 'utf-8');
			});

			return;
		}

		const headers = {'Content-Type': contentType};

		const cache_types = ['image/', 'video/', 'audio/', 'font/'];

		if (cache_types.some(type => contentType.startsWith(type))) {
			headers['Cache-Control'] = 'public, max-age=31536000';
		}

		res.writeHead(200, headers);

		let output = content;

		res.end(output, 'utf-8');

	});
}
