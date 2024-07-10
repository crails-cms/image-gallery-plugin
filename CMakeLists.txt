cmake_minimum_required(VERSION 3.5)

project(crails-cms-festival-plugin)

set(CMAKE_SHARED_LINKER_FLAGS "${CMAKE_SHARED_LINKER_FLAGS} -Wl,--no-undefined")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O1")

include_directories(. ../.. ${CRAILS_CMS_INCLUDE_DIRS})
link_directories(../../build)

set(ENV{CRAILS_CMS_INCLUDE_DIRS} "${CRAILS_CMS_INCLUDE_DIRS}")
execute_process(COMMAND ./prebuild.sh WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR})

file(GLOB_RECURSE plugin_files
  app/*.cpp app/*.cxx
  lib/*.cpp lib/*.cxx)

add_library(image_gallery SHARED ${plugin_files})
add_definitions(-DWITH_ODB)
set_target_properties(image_gallery PROPERTIES ENABLE_EXPORTS ON)
set_target_properties(image_gallery PROPERTIES PREFIX "")

install(TARGETS image_gallery LIBRARY DESTINATION lib/libcrails-cms)
install(FILES image_gallery.description.json image_gallery.description.png DESTINATION lib/libcrails-cms)
