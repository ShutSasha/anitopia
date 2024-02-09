import { FC, useContext, useEffect, useState } from "react";
import { Context } from "../../../main";
import { Loader } from "../../../shared";
import { Header } from "../../../widgets/header";
import styles from "./styles.module.scss";
import { observer } from "mobx-react-lite";
import { AnimeGeneralInfo } from "../../../widgets/anime_general_info";
import { PlayerBlock } from "../../../widgets/Player-block/ui/player-block";
import { AnimeScreenshots } from "../../../entities/ui/anime-screenshots/anime-screenshots";
import { useParams } from "react-router-dom";
import { handleClickRandomAnime } from "../api/fetchDataAnime";

export interface Rating {
	rating: number;
	logo: string;
	height: string;
	width: string;
}

export const RandomAnime: FC = observer(() => {
	const { store } = useContext(Context);
	let { id } = useParams();

	let anime = store.anime.animeData;
	let ratings = store.anime.ratingForAnime;

	useEffect(() => {
		if (id) {
			handleClickRandomAnime(
				store.randomAnime.setRandomAnime,
				store.randomAnime.setRatingForRandomAnime,
				store.setLoading,
				id
			);
		}
	}, []);
	console.log(anime);

	if (store.isLoading) {
		return <Loader />;
	}

	return (
		<>
			<Header />
			{anime && (
				<div className={styles.wrapper}>
					<div className={styles.container}>
						{anime.link && (
							<>
								<AnimeGeneralInfo anime={anime} ratings={ratings} />
								<div className={styles.player_container}>
									<PlayerBlock link={anime.link} />
								</div>
								{anime.screenshots && (
									<AnimeScreenshots screenshots={anime.screenshots} />
								)}
							</>
						)}
					</div>
				</div>
			)}
		</>
	);
});
