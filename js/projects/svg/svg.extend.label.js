const Label = function()
{
    this.setLabel = async function( text )
    {
        let content = text || this.name;
        
        this.setConfig( "label", content );

        let parent = this.getParent();
        
        let label = await this.svg( { name: "label", type: "text" } );
            label.setParent( parent );
            label.setStyle( { name: "text", font: "normal 1em sans serif", color: "white" } );
            label.setContent( content ); 
            label.center( parent );
        
        this.updates.push( () => label.link.innerText = content );
    };
}

export default Label;