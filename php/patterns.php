<?php 
function blocks_course_plugin_register_pattern_pattern_cat(){
    register_block_pattern_category('blocks-course', array(
        'label' => __('Blocks Course', 'block-course')
    ));
};

add_action('init','blocks_course_plugin_register_pattern_pattern_cat');

function blocks_course_plugin_register_pattern_pattern(){
    register_block_pattern('block-course/my-patterns', array(
        'title' => __('My Pattern' , 'blocks-course'),
        'categories' => array('blocks-course'),
        'keywords' => array('my pattern'),
        'content' => ''
    ));
};

add_action('init', 'blocks_course_plugin_register_pattern_pattern');