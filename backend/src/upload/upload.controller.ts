import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import * as fs from "fs";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

const ALLOWED = /\.(jpg|jpeg|png|webp|gif|mp4|mov|webm)$/i;
const MAX_SIZE = 100 * 1024 * 1024; // 100 MB

@Controller("upload")
export class UploadController {
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = join(process.cwd(), "uploads");
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, unique + extname(file.originalname).toLowerCase());
        },
      }),
      limits: { fileSize: MAX_SIZE },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED.test(file.originalname)) {
          cb(null, true);
        } else {
          cb(new BadRequestException("Недопустимый тип файла"), false);
        }
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("Файл не передан");
    const isVideo = file.mimetype.startsWith("video/");
    return {
      url: `/v1/uploads/${file.filename}`,
      type: isVideo ? "video" : "image",
      name: file.originalname,
    };
  }
}
