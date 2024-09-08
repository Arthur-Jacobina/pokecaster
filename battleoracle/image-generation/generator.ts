import sharp from 'sharp'

export const generateBattleList = async (
    pokemonIds: number[],
  ) => {
    try {
    const ComponentsArray = [];
    
    const baseImageBuffer = await sharp('./public/battle-oracle-base.png')
    .resize(600, 600)
    .jpeg()
    .toBuffer();
  
    const pokemon1ImageBuffer = await sharp(`./public/pokemons/${pokemonIds[0]}.png`)
    .resize(86, 86)
    .png()
    .toBuffer();
  
    const pokemon2ImageBuffer = await sharp(`./public/pokemons/${pokemonIds[1]}.png`)
    .resize(86, 86)
    .png()
    .toBuffer();
  
    const pokemon3ImageBuffer = await sharp(`./public/pokemons/${pokemonIds[2]}.png`)
    .resize(86, 86)
    .png()
    .toBuffer();
  
    ComponentsArray.push({input: pokemon1ImageBuffer, top: 60, left: 122});
    ComponentsArray.push({input: pokemon2ImageBuffer, top: 60, left: 258});
    ComponentsArray.push({input: pokemon3ImageBuffer, top: 60, left: 397});
    const finalImage = await sharp(baseImageBuffer)
    .composite(ComponentsArray)
    .jpeg()
    .toBuffer();
  
    return finalImage;
    } catch(error) {
        console.error("Error during battle checkout generation:", error);
        throw error;
    }
  }