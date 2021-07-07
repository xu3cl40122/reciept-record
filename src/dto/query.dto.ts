import { ApiProperty } from '@nestjs/swagger';
export class PageQueryDto {
  @ApiProperty({ required: false })
  page?: number
  @ApiProperty({ required: false })
  size?: number
  @ApiProperty({ required: false })
  order?: string
  @ApiProperty({ required: false })
  sort_by?: string
}

export class FileQueryDto extends PageQueryDto {
  @ApiProperty({ required: false })
  tag?: string
  @ApiProperty({ required: false })
  reference_id?: string
  @ApiProperty({ required: false })
  created_by?: string
}
