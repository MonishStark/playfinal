/** @format */

/**
 * List of pages to test on thefourthtwenty.ca
 * Each page has a path and a descriptive name for reports
 */

const pages = [
	// Main Pages
	{ path: "/", name: "01_Home" },
	{ path: "/about/", name: "02_About" },

	// Category Pages
	{ path: "/category/life/", name: "03_Category_Life" },
	{ path: "/category/politics/", name: "04_Category_Politics" },
	{ path: "/category/retirement/", name: "05_Category_Retirement" },
	{ path: "/category/other-stuff/", name: "06_Category_Other_Stuff" },

	// Blog Posts
	{ path: "/of-life-and-death/", name: "07_Post_Life_And_Death" },
	{
		path: "/welcome-to-my-existential-crisis/",
		name: "08_Post_Existential_Crisis",
	},
	{ path: "/my-home-and-native-land/", name: "09_Post_Home_Native_Land" },
	{ path: "/weekly-wtfs/", name: "10_Post_Weekly_WTFs" },
	{ path: "/weekly-wtf/floor-crossers/", name: "11_Post_Floor_Crossers" },
	{ path: "/welcome-home-baby/", name: "12_Post_Welcome_Home_Baby" },
	{
		path: "/head-and-shoulder-knees-and-toes/",
		name: "13_Post_Head_Shoulders",
	},
	{ path: "/weekly-wtf/parking/", name: "14_Post_Parking" },
];

module.exports = { pages };
