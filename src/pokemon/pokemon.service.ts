import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name) // to inject mongo model
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    try {
      createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async findAll(paginationDto:PaginationDto) {

    const {limit=10, offset=0} = paginationDto
    return await this.pokemonModel.find()
      .limit(limit)
      .skip(offset)
      .sort({
        no:1
      })
  }

  async findOne(term: string) {
    let pokemon: Pokemon | null = null;

    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({
        name: term.toLocaleLowerCase().trim(),
      });
    }

    if (!pokemon)
      throw new NotFoundException(`Pokemon with id ${term} not found`);
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    }

    try {
      await pokemon.updateOne(updatePokemonDto, { new: true });

      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  // if new = true it will show the new object intead of the old one

  async remove(id: string) {
    // const result = await this.pokemonModel.findByIdAndDelete(id)
    // return result

    const {deletedCount} = await this.pokemonModel.deleteOne({
      _id:id
    })
    if (deletedCount === 0){ // quantity of deleted items
      throw new BadRequestException(`Pokemon with ${id} not found`)
    }

    return;
  }


  private handleExceptions(error:any){
    console.log(error);
      if (error.code === 11000) {
        throw new BadRequestException(
          `Pokemon exists in db ${JSON.stringify(error.keyValue)}`,
        );
      }
  }  
}