import { Module } from "@nestjs/common";
import { UserController } from "./user.controler";
import { DatabaseModule } from "src/database/database.module";
import { AuthModule } from "src/auth/auth.module";
import { ComparisonModule } from "src/comparison/comparison.module";

@Module({
  imports: [ComparisonModule],
  controllers: [UserController],
})
export class UserModule {}
