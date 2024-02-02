return (
	<>
		{ /* For Customize edit options */ }
		<InspectorControls>
			<PanelBody>
				<RangeControl
					label={ __( 'Columns', 'team-members' ) }
					min={ 1 }
					max={ 6 }
					onChange={ onChangeColumn }
					value={ columns }
				/>
			</PanelBody>
		</InspectorControls>
		{ /* For Collect Text Input Field */ }
		<RichText
			placeholder={ __( 'Member Name', 'team-members' ) }
			tagName="h4"
			onChange={ onChangeName }
			value={ name }
			allowedFormats={ [] }
		/>
		{ /* For Uploading Image */ }
		<MediaPlaceholder
			icon="admin-users"
			onSelect={ onSelectImage }
			onSelectURL={ onSelectURL }
			onError={ ( err ) => console.log( err ) }
			accept="image/*"
			allowedTypes={ [ 'image' ] }
			disableMediaButtons={ url }
		/>
		{ /* Higher Order Component For Handle Error and get extra props on a component. that components come from wordpress components*/ }
		withNotices(); function onUploadError( message )
		{
			( noticeOperations.removeAllNotices(),
			noticeOperations.createErrorNotice( message ) )
		}
	</>
);
