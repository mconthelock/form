import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const driverObj = driver({
    showProgress: true,
    steps: [
        {
            element: '#menu',
            popover: {
                title: 'Animated Tour Example',
                description:
                    "Here is the code example showing animated tour. Let's walk you through it.",
                side: 'left',
                align: 'start',
            },
        },
        {
            element: '#profile a:nth-child(1)',
            popover: {
                title: 'Import the Library',
                description:
                    'It works the same in vanilla JavaScript as well as frameworks.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#profile a:nth-child(2)',
            popover: {
                title: 'Importing CSS',
                description:
                    'Import the CSS which gives you the default styling for popover and overlay.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#profile a:nth-child(2)',
            popover: {
                title: 'Importing CSS',
                description:
                    'Import the CSS which gives you the default styling for popover and overlay.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#wait',
            popover: {
                title: 'Importing CSS',
                description:
                    'Import the CSS which gives you the default styling for popover and overlay.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#prepare',
            popover: {
                title: 'Importing CSS',
                description:
                    'Import the CSS which gives you the default styling for popover and overlay.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#mine',
            popover: {
                title: 'Importing CSS',
                description:
                    'Import the CSS which gives you the default styling for popover and overlay.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '#comming',
            popover: {
                title: 'Importing CSS',
                description:
                    'Import the CSS which gives you the default styling for popover and overlay.',
                side: 'bottom',
                align: 'start',
            },
        },
    ],
});

export default driverObj;
