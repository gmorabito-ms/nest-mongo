import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {

  private readonly axios: AxiosInstance = axios;

  constructor(
    @InjectModel(Pokemon.name) // to inject mongo model
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter
  ) {}

  async executeSeed() {
    // clean de db
    await this.pokemonModel.deleteMany({})

    const  data  = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=300',
    );


    const pokemonInsert:{name:string, no:number}[] = []

    data.results.forEach(async ({ name, url }) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];
      // const pokemon = await this.pokemonModel.create({ name, no });
      pokemonInsert.push({ name, no })
    });

    await this.pokemonModel.insertMany(pokemonInsert) // will add the arr

    return 'seed executed';
  }
}
