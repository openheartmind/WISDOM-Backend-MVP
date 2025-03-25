import {  ApiPropertyOptional } from "@nestjs/swagger"

export class AddMemberDto {
    roleId: string
    @ApiPropertyOptional()
    instanceId: string
    userId: string
}