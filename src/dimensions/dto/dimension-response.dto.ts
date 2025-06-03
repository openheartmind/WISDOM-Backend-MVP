import { ApiProperty } from "@nestjs/swagger";


export class DimensionResponseDto {
  @ApiProperty({
    description: 'The id of the dimension'
  })
  id: string;

  @ApiProperty({
    description: 'The title of the dimension'
  })
  title: string;

  @ApiProperty({
    description: 'A question that helps describe the dimension'
  })
  question: string;
}
