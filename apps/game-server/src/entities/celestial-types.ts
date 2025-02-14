import { NodeGraphqlAPI } from '@idleverse/galaxy-gql';
import { Field, Float, InputType, ObjectType } from 'type-graphql';

@InputType()
export class RingInsertInput
  implements Omit<NodeGraphqlAPI.Planetary_Ring_Insert_Input, 'id'>
{
  @Field((type) => [String])
  colors: string[];

  @Field()
  inner_radius: number;

  @Field()
  outer_radius: number;

  @Field()
  resolution: number;

  @Field((type) => [Float])
  rotation: number[];

  @Field((type) => [Float])
  terrain_bias: number[];

  @Field()
  type: string;
}

@InputType()
export class RingInsertInputWrapper
  implements NodeGraphqlAPI.Planetary_Ring_Arr_Rel_Insert_Input
{
  @Field(() => [RingInsertInput])
  data: RingInsertInput[];
}

@InputType()
export class PlanetCreationInput implements NodeGraphqlAPI.Planet_Insert_Input {
  @Field()
  celestial_id: string;

  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  owner_id: string;

  @Field()
  radius: number;

  @Field(() => RingInsertInputWrapper)
  rings: RingInsertInputWrapper;

  @Field((type) => [Float])
  terrain_bias: number[];

  @Field()
  terrain_hex_palette_id: string;

  @Field()
  texture_resolution: number;

  @Field()
  atmospheric_distance: number;

  @Field()
  orbital_radius: number;
}

@ObjectType()
export class PartialPlanet
  implements Pick<NodeGraphqlAPI.Planet, 'id' | 'name' | 'owner_id'>
{
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  owner_id: string;
}

@ObjectType()
export class CelestialManagement {
  @Field()
  createdPlanet: PartialPlanet;
}
