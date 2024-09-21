# Changelog

## [1.3.4] - 2024-09-22

### Changed
- New Game Highlight: Added a function to check if a game is new (added within the last 7 days) and display a "ÚJ" (NEW) badge.
- New Badge Animation: Added wobble animation to the "ÚJ" (NEW) badge.
- Scroll-based Rendering: Games are now rendered on scroll to improve performance, loading sections dynamically as the user scrolls.
- Footer Modernization: Updated the footer with new styles, hover animations, and brand-specific colors for enhanced appearance.
- Game Entry Animations: Implemented smooth transitions and animations for game entries when they load or are hovered over.
- Category Section Updates: Added new game sections like "Tervezett" (Planned) and optimized the visibility toggling based on game presence.


## [1.3.3] - 2024-09-21

### Changed
- Transitions: Combined multiple transitions (transform, opacity) into single lines.
- Removed Redundancies: Eliminated unnecessary px for zero values.
- Footer: Streamlined layout; added underline hover animation for links.
- Media Queries: Consolidated mobile styles, optimized scaling of game containers.
- Game Cards: Centralized fadeIn animation for consistency.
- Scrollbar: Improved WebKit and Firefox scrollbar styling and hover effects.
- Search Bar: Smooth expand/collapse animation with opacity transitions.
- Buttons: Enhanced tooltip visibility and hover effects for Steam/YouTube buttons.
- Cookie Notice: Added hover scaling effect for cookie buttons.
- Modals: Smoother open/close animations for video modals.
- Categories: Simplified hover color transitions on category tags.
- Code Cleanup: Merged duplicate styles, reduced selector repetition, and improved efficiency.


## [1.3.2] - 2024-09-15

### Changed
- Optimized toggleSectionVisibility: Combined DOM manipulations for setting the display property of both the section and its header to avoid repetitive code.
- Simplified determineSectionKey: Introduced a sectionMap object to map the finish date codes (e.g., "VA", "AH") to section keys, reducing the number of conditional checks.
- Streamlined loadGamesOneByOne: Replaced the forEach loop for simpler, more readable iteration over the games while maintaining the delay between appending each game.
- Improved readability and structure: The code now follows a clearer and more consistent format, enhancing readability and maintainability.

## [1.3.2] - 2024-09-12

### Multiple games added

### Changed
- New category
- Improved security
- Added cookies
- New policy website
- Improved algorithm for html code.
- Updated UI components.

## [1.3.1] - 2024-08-29

### Changed
- For open-world games, it no longer says 'Completion time' but rather 'Playtime'.
- Temporarily, a search icon has been added to the top left corner, which helps to search among the games.
- The styles.css has been updated with more modern solutions and the addition of the search feature.
- Combined similar functionalities in event listeners to reduce repetition.
- Extracted the logic for showing or hiding sections into the 'toggleSectionVisibility' function for clarity.
- Ensured that the search input box remains visible if it has focus or contains text.

## [1.3.0] - 2024-08-26

### Changed
- New Design
- Improved algorithm for html code and js.
- Updated UI components.
- Performance Optimization
- Updated Phone UI components.
- Added 6 more backgrounds.
- Removed "waitLoadFully" spinner.

## [1.2.9] - 2024-08-24

### Multiple games added

### Changed
- New Design
- Improved algorithm for html code and js.
- Updated UI components.
- Performance Optimization
- New category's

## [1.2.8] - 2024-08-12

### Multiple games added

### Changed
- New Design
- Improved algorithm for html code.
- Updated UI components.
- Performance Optimization
- New category's

## [1.2.7] - 2024-08-09

### Changed
- New Design
- Improved algorithm for html code.
- Updated UI components.
- Performance Optimization

## [1.2.6] - 2024-08-04

### New games added
- Neighbours from Hell
- Neighbours from Hell 2: On Vacation
- Neighbours back From Hell

### Changed
- New back to top button
- Improved algorithm for html code.
- Updated UI components.

## [1.2.5] - 2024-07-30

### Changed
- New category
- Improved security
- Added cookies
- New policy website
- Improved algorithm for html code.
- Updated UI components.

## [1.2.4] - 2024-07-21

### Changed

- Improved algorithm for html code.
- Updated UI components.
- Added new background elemnts.

## [1.2.3] - 2024-06-30

### Changed

- Improved algorithm for html code.
- Updated UI components.
- Added new elements.

## [1.2.2] - 2024-06-23

### Changed

- Improved algorithm for html code.
- Updated UI components.

## [1.2.1] - 2024-06-13

### New game finish

- Red Dead Redemption 2

### Changed

- Improved algorithm for html code.
- Updated UI components.

### Fixed

- Bug fix for issue with A.
- Fixed compatibility issue with B.

## [1.2.0] - 2024-06-08

### New game finish

- High on Life
- High on Life: High on Knife

### Changed

- Code cleanup

## [1.1.0] - 2024-05-25

### New game finish

- Dying light 

### Changed

- Refactored code in module Y for better readability.
- Updated styling in component Z.

## [1.0.1] - 2024-05-11

### New game finish

- Doom 1993

## [1.0.0] - 2024-04-06

- Initial release of gamelist.

### Added

- Implemented core features.
- Added basic UI layout.

### Changed

- Improved overall performance.
- Enhanced user experience with new animations.

### Fixed

- Fixed major bugs related to data synchronization.
- Resolved compatibility issues with older browsers.

