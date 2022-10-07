async function details( parent, records, _title )
{
    let box = await parent.addContainer( { id: "records", type: "box", format: "block" } );
    let title = await box.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
        title.set( _title || "Records" );

    let tuple = await box.addComponent( { id: "details", type: "tuple", format: "block", output: "object" } );
        tuple.set( records );
}

export default details;