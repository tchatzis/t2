const UI = function()
{
    let self = this;
    
    this.addComponent = function( uiParams )
    {
        
    };
    
    this.init = function( components )
    {
        components.forEach( component =>
        {
            console.log( component );
        } );
    };
    
    //this.layout = new Map();
};

export default UI;