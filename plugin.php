<?php
/**
 * Plugin Name:       Team Members
 * Description:       This is a simple grid for team members card by shaped plugin.
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Shaped Plugin
 * Author URI:        https://www.shapedplugin.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       blocks-course-team-members
 *
 * @package           blocks-course
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
include_once('php/patterns.php');
// include_once('php/filters.php');
function blocks_course_team_members_block_init() {
	register_block_type( __DIR__ . '/build' );
}
add_action( 'init', 'blocks_course_team_members_block_init' );

