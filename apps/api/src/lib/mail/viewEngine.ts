import * as path from 'path';
import { create } from 'express-handlebars';

const viewEngineInstance = create({
  extname: '.handlebars',
  partialsDir: path.resolve(
    process.cwd(),
    'src/lib/mail/templates'
  ),
  defaultLayout: false,
});

const handlebarOptions = {
  viewEngine: viewEngineInstance, // Pass the view engine instance
  viewPath: path.resolve(process.cwd(), 'src/lib/mail/templates'),
  extName: '.handlebars',
};

export default handlebarOptions;
