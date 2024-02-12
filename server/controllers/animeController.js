const animeSerials = require("../anime-serial.json");
const AnimeService = require("../services/AnimeService");
const { format } = require("date-fns");
const { ca } = require("date-fns/locale/ca");
const { resetWatchers } = require("nodemon/lib/monitor/watch");

class AnimeController {
	async getAnimeList(req, res, next) {
		try {
			const data = animeSerials;
			const uniqueData = await AnimeService.removeDuplicates(data, "title");
			const sortedData = AnimeService.sortByRating(uniqueData);
			const startIndex = req.query.page * req.query.limit || 0;
			const count = req.query.limit || 10;
			const result = await AnimeService.getAnimeSubset(
				sortedData,
				startIndex,
				count
			);
			return res.json(result);
		} catch (e) {
			next(e);
		}
	}

	async getAnimeSeason(req, res, next) {
		try {
			// const date = new Date();
			//const formattedDate = format(date, "yyyy-MM-dd");

			const animeData = animeSerials;
			const sliceData = animeData.slice(0, 100);
			const filterData = await AnimeService.removeDuplicates(
				sliceData,
				"title"
			);

			const animeWithDate = filterData.filter(
				(item) => item.material_data.premiere_world != undefined
			);

			const seasonAnime = animeWithDate.filter((item) => {
				const premiereYear = Number(
					item.material_data.premiere_world.split("-")[0]
				);
				return premiereYear === 2023;
			});

			return res.json(seasonAnime);
		} catch (error) {
		}
	}

	async getAnime(req, res, next) {
		try {
			const { id } = req.params;
			const animeData = animeSerials;
			const anime = animeData.find((item) => item.id === id);

			return res.json(anime);
		} catch (error) {
		}
	}

	async searchAnime(req, res, next) {
		try {
			const { title } = req.params;
			const data = animeSerials;
			const searchedAnime = await AnimeService.findAnime(data, title);
			const uniqueData = await AnimeService.removeDuplicates(searchedAnime);
			console.log("Длинна списка: " + searchedAnime.length);
			return res.json(searchedAnime);
		} catch (e) {
			next(e);
		}
	}
}

module.exports = new AnimeController();
