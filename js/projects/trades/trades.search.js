    /*async function range()
    {
        let max = t2.formats.isoDate( Date.now() );
        let min = t2.formats.isoDate( self.data.datetime[ 0 ] );

        let dates = await t2.ui.addComponent( { id: "range", component: "form", parent: t2.ui.elements.get( "subcontent" ), module: self, horizontal: true } );
            dates.form.addEventListener( "submit", self.setDates );
            dates.addField( { 
                input: { name: "from", type: "date", value: self.from || min, min: min, max: max, required: "" }, 
                cell: { css: {}, display: 8 },
                format: [ "date" ] } );
            dates.addField( { 
                input: { name: "to", type: "date", value: self.to || max, min: min, max: max, required: "" }, 
                cell: { css: {}, display: 8 },
                format: [ "date" ] } );
            dates.addField( { 
                input: { type: "submit", value: "FILTER" }, 
                cell: { css: {}, display: 4 },
                format: [] } );
    };*/

const Search = function( module )
{
    let self = this;

    this.run = async function()
    {
        Object.assign( module, this );

        await this.refresh();  
    };

    this.refresh = async function()
    {
        await module.queries(); 
        await layout();   
    };

    async function layout()
    {

    }
};

export default Search;