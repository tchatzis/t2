export default function( parameters )
{
    let w = parameters.parent.clientWidth;
    let h = parameters.parent.clientHeight;

    let load = async () => await t2.common.svg( "svg" );
    
    let set = async () =>
    {
        this.element = await load();
        this.element.dataset.name = parameters.name;
        this.element.dataset.type = parameters.type;
        this.element.setAttribute( "width", w );
        this.element.setAttribute( "height", h );
        this.element.setAttribute( "viewBox", `0, 0, ${ w }, ${ h }` );
        
        this.parent = t2.common.el( "div", parameters.parent );
        this.parent.dataset.name = parameters.name;
        this.parent.dataset.type = parameters.type; 

        return this;
    };

    return set();
};