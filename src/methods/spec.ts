import { ApiProperty } from '@nestjs/swagger';


class GetManyResponse<Entity> {
  @ApiProperty({ type: Object, isArray: true }) // will be overwritten
  public content: Entity[];

  @ApiProperty()
  public count?: number;
  @ApiProperty({ default: 10 })
  public size?: number;
  @ApiProperty()
  public total?: number;
  @ApiProperty()
  public totalPage?: number;
}


type Entity = Function;
export function getManyResponseFor(type: Entity): typeof GetManyResponse {
  class GetManyResponseForEntity<Entity> extends GetManyResponse<Entity> {
    @ApiProperty({ type, isArray: true })
    public content: Entity[];
  }
  Object.defineProperty(GetManyResponseForEntity, 'name', {
    value: `GetManyResponseFor${type.name}`,
  });

  return GetManyResponseForEntity;
}