import path from "node:path";

/** Где лежат приглашения и загруженные файлы. По умолчанию — папка data в корне проекта. */
export const DATA_DIR = process.env.ZOVI_DATA_DIR || path.join(process.cwd(), "data");
