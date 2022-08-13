const Container = function( module )
{
    let self = this;

    this.init = function( params )
    {
        this.element = t2.common.el( "div", params.parent );
        this.element.classList.add( "container" );

        this.title = t2.common.el( "div", this.element );
        this.title.classList.add( "title" );
        this.title.textContent = params.title;
    };

    this.setTitle = function( title )
    {
        this.title.textContent = title;
    };
};

export default Container;