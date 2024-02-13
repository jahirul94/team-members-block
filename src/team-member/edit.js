import { useEffect, useState, useRef } from '@wordpress/element';
import {
	useBlockProps,
	RichText,
	MediaPlaceholder,
	BlockControls,
	MediaReplaceFlow,
	InspectorControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';

import {
	DndContext,
	useSensor,
	useSensors,
	PointerSensor,
} from '@dnd-kit/core';
import {
	SortableContext,
	horizontalListSortingStrategy,
	arrayMove,
} from '@dnd-kit/sortable';

import { useSelect } from '@wordpress/data';
import { usePrevious } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { isBlobURL, revokeBlobURL } from '@wordpress/blob';
import SortableItem from './sortable-item';
import {
	Spinner,
	withNotices,
	ToolbarButton,
	PanelBody,
	TextareaControl,
	SelectControl,
	Icon,
	Tooltip,
	TextControl,
	Button,
} from '@wordpress/components';

function Edit( {
	attributes,
	setAttributes,
	noticeOperations,
	context,
	noticeUI,
	isSelected,

} ) {
	const { name, bio, url, alt, id, socialLinks } = attributes;
	const sensors = useSensors(
		useSensor( PointerSensor, {
			activationConstraint: { distance: 5 },
		} )
	);

	const [ blobURL, setBlobURL ] = useState();
	const [ selectedLink, setSelectedLink ] = useState();
	const titleRef = useRef();
	const prevURL = usePrevious( url );
	const prevSelected = usePrevious( isSelected );

	const imageObject = useSelect(
		( select ) => {
			const { getMedia } = select( 'core' );
			return id ? getMedia( id ) : null;
		},
		[ id ]
	);

	const imageSizes = useSelect( ( select ) => {
		return select( blockEditorStore ).getSettings().imageSizes;
	}, [] );

	const onChangeImageSize = ( newURL ) => {
		setAttributes( { url: newURL } );
	};

	const getImageSizeOptions = () => {
		if ( ! imageObject ) return [];
		const options = [];
		const sizes = imageObject.media_details.sizes;
		for ( const key in sizes ) {
			const size = sizes[ key ];
			const imageSize = imageSizes.find( ( s ) => s.slug === key );
			if ( imageSize ) {
				options.push( {
					label: imageSize.name,
					value: size.source_url,
				} );
			}
		}
		return options;
	};

	const onChangeName = ( newName ) => {
		setAttributes( { name: newName } );
	};
	const onChangeBio = ( newBio ) => {
		setAttributes( { bio: newBio } );
	};

	const onSelectImage = ( image ) => {
		if ( ! image || ! image.url ) {
			setAttributes( { url: undefined, id: undefined, alt: '' } );
			return;
		}

		setAttributes( { url: image.url, id: image.id, alt: image.alt } );
	};

	const onSelectURL = ( newURL ) => {
		setAttributes( {
			url: newURL,
			id: undefined,
			alt: '',
		} );
	};

	const onUploadError = ( message ) => {
		noticeOperations.removeAllNotices();
		noticeOperations.createErrorNotice( message );
	};

	const removeImage = () => {
		setAttributes( {
			url: undefined,
			alt: undefined,
			id: undefined,
		} );
	};

	const onChangeAlt = ( newAlt ) => {
		setAttributes( { alt: newAlt } );
	};

	const addNewSocialItem = () => {
		setAttributes( {
			socialLinks: [ ...socialLinks, { icon: 'wordpress', link: '' } ],
		} );
		setSelectedLink( socialLinks.length );
	};

	const updateSocialItem = ( type, value ) => {
		const socialLinksCopy = [ ...socialLinks ];
		socialLinksCopy[ selectedLink ][ type ] = value;
		setAttributes( { socialLinks: socialLinksCopy } );
	};

	const removeSocialItem = () => {
		setAttributes( {
			socialLinks: [
				...socialLinks.slice( 0, selectedLink ),
				...socialLinks.slice( selectedLink + 1 ),
			],
		} );
		setSelectedLink();
	};

	const handleDragEnd = ( event ) => {
		const { active, over } = event;
		if ( active && over && active.id !== over.id ) {
			const oldIndex = socialLinks.findIndex(
				( i ) => active.id === `${ i.icon }-${ i.link }`
			);

			let newIndex = socialLinks.findIndex(
				( i ) => over.id === `${ i.icon }-${ i.link }`
			);

			setAttributes( {
				socialLinks: arrayMove( socialLinks, oldIndex, newIndex ),
			} );
			setSelectedLink( newIndex );
		}
	};

	useEffect( () => {
		if ( ! id && isBlobURL( url ) ) {
			setAttributes( {
				url: undefined,
				alt: '',
			} );
		}
	}, [] );

	useEffect( () => {
		if ( isBlobURL( url ) ) {
			setBlobURL( url );
		} else {
			revokeBlobURL( blobURL );
			setBlobURL();
		}
	}, [ url ] );

	useEffect( () => {
		if ( url && ! prevURL && isSelected ) {
			titleRef.current.focus();
		}
	}, [ url, prevURL ] );

	useEffect( () => {
		if ( prevSelected && ! isSelected ) {
			setSelectedLink();
		}
	}, [ isSelected, prevSelected ] );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Image Settings', 'team-members' ) }>
					{ id && (
						<SelectControl
							label={ __( 'Image Setting', 'team-members' ) }
							options={ getImageSizeOptions() }
							value={ url }
							onChange={ onChangeImageSize }
						/>
					) }

					{ url && ! isBlobURL( url ) && (
						<TextareaControl
							label={ __( 'Alt Text', 'team-members' ) }
							onChange={ onChangeAlt }
							help={ __(
								'Alternative text describe your image to people cant see it.',
								'team-members'
							) }
						/>
					) }
				</PanelBody>
			</InspectorControls>
			{ url && (
				<BlockControls group="inline">
					<MediaReplaceFlow
						name={ __( 'Replace Image', 'team-members' ) }
						onSelect={ onSelectImage }
						onSelectURL={ onSelectURL }
						onError={ onUploadError }
						accept="image/*"
						allowedTypes={ [ 'image' ] }
						mediaId={ id }
					/>
					<ToolbarButton onClick={ removeImage }>
						{ __( 'Remove Image', 'team-members' ) }
					</ToolbarButton>
				</BlockControls>
			) }
			<div { ...useBlockProps }>
				{ url && (
					<div
						className={ `wp-block-blocks-course-team-member-img${
							isBlobURL( url ) ? ' is-loading' : ''
						}` }
					>
						<img src={ url } alt={ alt } />
						{ isBlobURL( url ) && <Spinner /> }
					</div>
				) }
				<MediaPlaceholder
					icon="admin-users"
					onSelect={ onSelectImage }
					onSelectURL={ onSelectURL }
					onError={ onUploadError }
					accept="image/*"
					allowedTypes={ [ 'image' ] }
					disableMediaButtons={ url }
					notices={ noticeUI }
				/>
				<RichText
					ref={ titleRef }
					placeholder={ __( 'Member Name', 'team-members' ) }
					tagName="h4"
					onChange={ onChangeName }
					value={ name }
					allowedFormats={ [] }
				/>
				{/* {context['blocks-course/team-members-columns']} */}
				<RichText
					placeholder={ __( 'Member Bio', 'team-members' ) }
					tagName="p"
					onChange={ onChangeBio }
					value={ bio }
					allowedFormats={ [] }
				/>
				<div className="wp-block-blocks-course-team-member-social-links">
					<ul>
						<DndContext
							sensors={ sensors }
							onDragEnd={ handleDragEnd }
							modifiers={ [ restrictToHorizontalAxis ] }
						>
							<SortableContext
								items={ socialLinks.map(
									( item ) => `${ item.icon }-${ item.link }`
								) }
								strategy={ horizontalListSortingStrategy }
							>
								{ socialLinks?.map( ( item, index ) => {
									return (
										<SortableItem
											key={ `${ item.icon }-${ item.link }` }
											id={ `${ item.icon }-${ item.link }` }
											index={ index }
											selectedLink={ selectedLink }
											setSelectedLink={ setSelectedLink }
											icon={ item.icon }
										/>
									);
								} ) }
							</SortableContext>
						</DndContext>
					</ul>
					<ul>
						{ isSelected && (
							<li className="wp-block-blocks-course-team-member-add-icon-list">
								<Tooltip
									text={ __(
										'Add Social Link',
										'team-members'
									) }
								>
									<button
										aria-label={ __(
											'Add Social Link',
											'team-members'
										) }
										onClick={ addNewSocialItem }
									>
										<Icon icon="plus-alt" />
									</button>
								</Tooltip>
							</li>
						) }
					</ul>
				</div>{ ' ' }
				<br />
				{ selectedLink !== undefined && (
					<div className="wp-block-blocks-course-team-member-link-form">
						<TextControl
							label={ __( 'Icon', 'text-members' ) }
							value={ socialLinks[ selectedLink ]?.icon }
							onChange={ ( icon ) =>
								updateSocialItem( 'icon', icon )
							}
						/>
						<TextControl
							label={ __( 'URL', 'text-members' ) }
							value={ socialLinks[ selectedLink ]?.link }
							onChange={ ( link ) =>
								updateSocialItem( 'link', link )
							}
						/>{ ' ' }
						<br />
						<Button isDestructive onClick={ removeSocialItem }>
							{ __( 'Remove Link', 'text-members' ) }
						</Button>
					</div>
				) }
			</div>
		</>
	);
}

export default withNotices( Edit );
