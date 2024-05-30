import fs from "fs";
import Handlebars from "handlebars";
import { default as Path } from "node:path";
import { fileURLToPath } from "url";

export const BASE_PATH = Path.dirname(
  Path.dirname(Path.dirname(fileURLToPath(import.meta.url))),
);
export const getTemplate = (path) => {
  const data = fs.readFileSync(Path.join(BASE_PATH, path), "utf-8");
  return data;
};

export const renderTemplate = ({ template, data = {} }) => {
  const renderer = Handlebars.compile(template);
  return renderer(data);
};

export const getEmailTemplate = ({ path, data = {} }) => {
  const template = getTemplate(path);
  return renderTemplate({ template: template, data: data });
};
