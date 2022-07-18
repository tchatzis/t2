export default function( parameters )
{   
    let load = async () => await t2.common.svg( parameters.type );
    
    let set = async () =>
    {
        this.element = await load();
        this.element.dataset.name = parameters.name;
        this.element.dataset.type = parameters.type;

        this.parent = parameters.parent;

        return this;
    };

    this.attributes = [ "cx", "cy", "rx", "ry" ];

    return set();
};