import { IsArray, IsUUID } from 'class-validator';

export class SetProductTagsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds: string[];
}
