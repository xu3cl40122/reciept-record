import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
export class FileDto {
  @IsOptional()
  @ApiProperty()
  file_id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  file_name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  tag: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  file_url: string;

  // @ApiProperty()
  created_by?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  reference_id: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  is_public: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty()
  description: string;

  @IsOptional()
  @ApiProperty()
  meta: object;
}


