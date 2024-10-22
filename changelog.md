# Changelog

# Changelog

## [1.3.6.c] - 2024-10-22

### **New Features**
- **Holiday Themed Back-to-Top Button:**
  - Added dynamic themes for the "Back to Top" button to celebrate special holidays:
    - 🎃 **Halloween Theme** (October 31):
      - A bouncing pumpkin icon replaces the standard button, featuring a spooky design.
      - The button animates with a gentle bounce effect to create a festive atmosphere.
      - **CSS Changes**: Introduced new keyframes for the bouncing animation.
    - 🎄 **Christmas Theme** (December 24-26):
      - The button now has a glowing Christmas tree icon.
      - The button glows with a soft pulsating white light, enhancing the festive spirit.
    - 🎆 **New Year Theme** (December 31 & January 1):
      - A firework rocket icon that launches upward.
      - After reaching the top of the page, it triggers a **confetti explosion** animation.
      - **Confetti Explosion**: Includes confetti pieces falling from the top of the page in various random colors.
      - **Year Display**: Some confetti pieces display the new year's digits (e.g., "2024") in a larger, clearer font.

<details>
<summary>🎆 **New Year's Confetti Explosion Details**</summary>

  - **Smooth Fall Animation**: Confetti pieces gently fall from the top of the page, simulating gravity.
  - **Random Colors**: Confetti pieces are assigned random colors from a pre-defined palette.
  - **Year Numbers**: Some confetti pieces show the new year's digits. These pieces fall without rotating, unlike the regular confetti.
  - **Duration**: Confetti remains visible for an extended period, ensuring users experience the effect fully. The effect is designed to last longer for visual impact.

</details>

- **Holiday-Specific Animations**:
  - Each holiday now has a unique button animation tied to the theme:
    - **Halloween**: A bouncing effect on the pumpkin icon.
    - **Christmas**: A glowing pulsating effect on the Santa icon.
    - **New Year**: A firework animation that triggers the confetti explosion when the button reaches the top.

### **Bug Fixes**
- **Button Icon Persistence During Special Events**:
  - Fixed an issue where the default "Back to Top" arrow icon would occasionally appear during holiday themes. Now, the themed icons fully replace the arrow, and the arrow does not reappear.
- **Confetti Reset on Scroll**:
  - Addressed an issue where confetti would persist even after scrolling to the top and back down again. The confetti now properly resets after the event.

### **UI/UX Improvements**
- **Improved Button Interactions**:
  - Updated hover animations across all themes:
    - **Hover Effect**: The button now scales up smoothly when hovered, with an enhanced box shadow for better visibility.
  - **General Button Enhancements**:
    - Enlarged the button to 64x64px for better visibility on both desktop and mobile screens.
    - All icons are now retina-friendly, ensuring they appear crisp on high-resolution displays.
  
<details>
<summary>👻 **Minor UI Tweaks**</summary>

  - **Back-to-Top Button Size Consistency**: Ensured that the button size remains consistent (64px) across all holiday themes.
  - **Smooth Scroll Enhancements**: Improved the smooth scrolling effect when the button is clicked, adding more subtle easing for a polished experience.
  - **Confetti Design Improvements**: Adjusted confetti size and fall speed to provide a more visually engaging and playful effect, particularly for New Year's.

</details>

### **Code Enhancements**
- **Modular Holiday Detection**:
  - Refactored the date-checking logic to be more modular, allowing for easy addition of future holiday themes.
  - Consolidated all holiday themes into a single function to avoid repetition.
- **Optimized Confetti Animation**:
  - The confetti effect is now managed through a dedicated function that can be reused for future events without re-creating the logic.
  - **CSS Optimization**: Reduced the amount of CSS required for confetti by utilizing keyframe animations more efficiently.

<details>
<summary>📄 **Additional Code Enhancements**</summary>

  - **Event Detection**: The code now efficiently checks for holiday events like Halloween, Christmas, and New Year without affecting page performance.
  - **Refined Confetti Mechanism**: Simplified the confetti creation logic to improve performance on slower devices, particularly mobile.
  - **Easing Functions**: Added more easing options to animations for smoother transitions and interactions.

</details>

## [1.3.6] - 2024-09-29 / [1.3.6.b] - 2024-10-21

### New Features

- Redesigned **Cookie Consent Banner** with smooth animations, distinct button styles, and modal for cookie preferences.
- Added **Dynamic Background Images** that change randomly upon page load for a fresh user experience.
- Introduced **Radial Progress Bar** with interactive hover effects and color-coded progress levels (low, medium, good, high, complete).
- **Back to Top Button** now features a spinning animation while scrolling back and hover enlargement for better visibility.

### Changes

- Removed **Analytics and Marketing Cookies** from the cookie policy to focus on essential cookie management.
- Simplified the **Cookie Preferences Modal** to include only necessary cookies, with a clearer design and user flow.
- Enhanced **Game List Filtering** for better user experience, displaying and organizing games by categories such as in-progress, pending, completed, etc.
- Updated **Game Cards** to show more detailed information, including release dates, playtime, and progress with visually appealing designs.

### UI/UX Improvements

- Improved hover effects on **Game Cards** to enhance interactivity, including showing and hiding elements like progress bars and new badges.
- Unified the **Button Styles** across the site to maintain a consistent look, with hover animations and better touch targets.
- Made **Modal Windows** more intuitive by improving their appearance, positioning, and overlay for a modern user experience.
- General **UI Cleanup** for consistent spacing, hover effects, and animations across buttons, cards, and other interactive elements.

### Mobile & Performance

- Optimized the website for **Mobile Responsiveness**, ensuring better layouts, touch targets, and smaller font sizes on smaller screens.
- Adjusted **Cookie Banner** and **Modal Layouts** for smaller screens, maintaining usability without sacrificing design.
- Added **Error Handling** for failed game data fetches, displaying user-friendly messages when content cannot be loaded.

### Bug Fixes

- Fixed an issue with **Game Data Fetching** that prevented JSON files from loading properly.
- Resolved a bug where certain **Progress Bars** and **Badges** did not display correctly on hover.
- Corrected the positioning of **Cookie Consent Banner** on different screen sizes to prevent it from overlapping with content.

<details>
<summary>[1.3.6.b] - 2024-10-21</summary>
<ul><li>Code fine-tuning</li></ul>
</details>

## [1.3.5] - 2024-09-29

### New Features

- **Radial Progress Bar:**
  - Implemented a new radial progress bar that dynamically updates based on the percentage of game completion.
  - Added color transitions for different percentage ranges (e.g., pink for 0-20%, green for 80-100%).
  - Smooth hover animations on game cards to reveal the radial progress bar.
- **Hover Effects:**
  - **Game Card Interactions:** Game cards now have smooth scaling effects, with images darkening when hovered.
- **New Badge:**
  - Introduced a wobble animation for newly added games. The “ÚJ”(NEW) badge now shakes when visible but hides when the mouse hovers over the game card.

### Bug Fixes

- **Year Display Fix:**
  - Fixed a bug where the current year was not being dynamically inserted into the footer. Added an event listener to ensure it works correctly after the DOM is fully loaded.
- **Tooltip Visibility:**
  - Removed tooltips from radial progress bars as they caused display issues on hover.
- **UI Responsiveness:**
  - Improved responsiveness for smaller screens, particularly for game cards and button positioning.

### Enhancements

- **Styling and UI Overhaul:**
  - Updated the radial progress bar to feature an outer ring instead of filling the internal area.
  - Enhanced game card shadows and scaling for better visual depth when hovering.
  - Added hover transitions for category tags and buttons.
- **Performance Optimization:**
  - Deferred JavaScript loading for better page speed and load time.
  - Optimized animations to reduce performance overhead.

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
