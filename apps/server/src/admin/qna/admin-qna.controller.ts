import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AdminQnaService } from "./admin-qna.service";
import { AdminQnaQueryDto } from "./dto/qna-query.dto";
import { AnswerQnaDto } from "./dto/answer-qna.dto";
// ... import guards, decorators, RoleName ...
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { RoleName } from "@ezpg/database";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { TfaSessionGuard } from "../../auth/guards/tfa-session.guard";
import { FirstLoginGuard } from "../../auth/guards/first-login.guard";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import {
  PaginatedQnaResponseDto,
  QnaResponseDto,
} from "./dto/qna-response.dto";
import { JwtUser } from "../../auth/interfaces/jwt-user.interface";

@ApiTags("Admin - QnA")
@ApiBearerAuth("jwt-bearer-auth")
@Controller("admin/qna")
@UseGuards(JwtAuthGuard, TfaSessionGuard, FirstLoginGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminQnaController {
  constructor(private readonly qnaService: AdminQnaService) {}

  @Get()
  @ApiOperation({
    summary: "List All QnAs",
    description:
      "Retrieves a paginated list of all QnAs with optional filters.",
  })
  @ApiQuery({ type: AdminQnaQueryDto })
  @ApiResponse({
    status: 200,
    description: "List of QnAs retrieved successfully.",
    type: PaginatedQnaResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required.",
  })
  findAll(
    @Query() query: AdminQnaQueryDto,
  ): Promise<PaginatedResult<QnaResponseDto>> {
    // Page References: Admin -> 1:1 문의 관리 (admin.pdf, page 1)
    return this.qnaService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get QnA Details",
    description: "Retrieves details of a specific QnA entry.",
  })
  @ApiParam({
    name: "id",
    type: "number",
    description: "ID of the QnA entry",
    example: 123,
  })
  @ApiResponse({
    status: 200,
    description: "QnA details retrieved successfully.",
    type: QnaResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required.",
  })
  @ApiResponse({ status: 404, description: "QnA not found." })
  findOne(@Param("id", ParseIntPipe) id: number): Promise<QnaResponseDto> {
    // Page References: Admin -> 1:1 문의 관리 -> 상세보기
    return this.qnaService.findOne(id);
  }

  @Post(":id/answer")
  @ApiOperation({ summary: "Answer a QnA inquiry" })
  @ApiParam({ name: "id", description: "QnA ID", example: 1 })
  @ApiBody({ type: AnswerQnaDto })
  @ApiResponse({
    status: 200,
    description: "The QnA has been successfully answered.",
    type: QnaResponseDto,
  })
  @ApiResponse({ status: 404, description: "QnA not found" })
  answer(
    @Param("id") id: number,
    @Body() dto: AnswerQnaDto,
    @CurrentUser() user: JwtUser,
  ): Promise<QnaResponseDto> {
    return this.qnaService.answer(id, dto, user.userId);
  }
}
