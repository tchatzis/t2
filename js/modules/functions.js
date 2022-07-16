import common from "./common.js";

const functions =
{
    scale: function()
    {
        let axes = [ "x", "y", "z" ];
 
        return Array.from( arguments ).map( ( value, i ) => Math.round( common.get( "settings.factor" )[ axes[ i ] ] * value ) );
    },
  

    

};

export default functions;
