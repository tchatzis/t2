import Common from "../../t2/t2.container.handlers.js";
import details from "./trades.fix.details.js";
import handlers from "./trades.fix.handlers.js";

const Panel = function ( module ) 
{
    let self = this;
    let panel;

    this.init = async function( parent, params ) 
    {
        panel = await parent.addContainer( { id: "panel", type: "box", format: "flex", css: [ "panel" ] } );

        this.element = panel.element;
        this.type = panel.type;

        Object.assign( this, params );
        Common.call( this );
    };

    this.refresh = async function() 
    {
        await module.queries();

        await navigation();
    };

    async function navigation() 
    {
        await t2.navigation.update(
            [
                { id: "submenu", functions: [{ ignore: "clear" }, { clear: null }] },
                { id: "subcontent", functions: [{ ignore: "clear" }] },
                { id: "submargin", functions: [{ ignore: "clear" }, { clear: null }] },
                { id: "menu", functions: [{ ignore: "clear" }] },
                { id: "content", functions: [{ ignore: "clear" }] },
                { id: `content.panels.${self.id}`, functions: [{ clear: null }, { invoke: [{ f: output, args: null }] }] },
                { id: "margin", functions: [{ ignore: "clear" }] }
            ] );
    }

    async function output() 
    {
        let outline = await this.addContainer( { id: "outline", type: "box", format: "block" } );

        let form = await outline.addComponent({ id: "test", type: "form", format: "flex" });
            form.addListener({ type: "submit", handler: test });
            form.addField({
                input: { name: "symbol", type: "select", required: "" },
                cell: { css: {}, display: 4 },
                format: [],
                options: module.data.symbol
            });
            form.addField({
                input: { name: "split", type: "number", step: 1, required: "" },
                cell: { css: {}, display: 4 }
            });
            form.addField({
                input: { type: "submit", value: "SPLIT" },
                cell: { css: {}, display: 4 },
                format: []
            });
            form.addField({
                input: { type: "submit", value: "REVERSE" },
                cell: { css: {}, display: 4 },
                format: []
            });

        async function test(submit) {
            let records = await t2.db.tx.filter(module.q.table, [{ key: "symbol", operator: "==", value: submit.data.symbol }]);
                records.fields = submit;

            let direction = submit.event.submitter.value;

            records.fields.data.direction = direction;

            let confirmed = confirm( `OK to ${ direction }?` );

            if (!confirmed)
                return;

            await handlers.split( module.q.table, records.data, submit.data );   
        };
    };
};

export default Panel;