import { FC, useContext, useEffect, useRef, useState } from "react";
import { Context } from "../../../main";
import { observer } from "mobx-react-lite";
import { Header } from "../../../widgets/header";
import styles from "./styles.module.scss";
import { ProfileBgImg } from "../../../features";
import { useNavigate } from "react-router-dom";
import { NotFoundPage } from "../../not-found";
import $api from "../../../app/http";

export const Profile: FC = observer(() => {
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const { store } = useContext(Context);
	const navigate = useNavigate();
	const [img, setImage] = useState<File | null>(null);

	const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			const selectedImage = event.target.files[0];
			setImage(selectedImage);
			//! null?? what
			console.log(img);
		}
	};

	useEffect(() => {
		if (img) {
			const formData = new FormData();
			formData.append("img", img);
			formData.append("username", store.user.username);

			$api
				.post(`/profile/uploadAvatar`, formData)
				.then(() => console.log("Картинка успешно загружена"))
				.catch((err) => console.error(err));
		}
	}, [img]);

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	// const handleFormSubmit = (event: React.FormEvent) => {
	// 	event.preventDefault();
	// 	if (img) {
	// 		const formData = new FormData();
	// 		formData.append("img", img);
	// 		formData.append("username", store.user.username);

	// 		$api
	// 			.post(`/profile/uploadAvatar`, formData)
	// 			.then(() => console.log("Картинка успешно загружена"))
	// 			.catch((err) => console.error(err));
	// 	}
	// };

	if (store.isLoading) {
		return <div>Загрузка...</div>;
	}

	if (!store.isAuth) {
		navigate("/login");
		return <NotFoundPage />;
	}

	if (store.isAuth) {
		return (
			<div>
				<div className={styles.header}>
					<Header />
				</div>
				<div className={styles.container}>
					<div className={styles.profile_bg_img}>
						<ProfileBgImg />
					</div>
					<div className={styles.profile_wrapper}>
						<div className={styles.main_user_info}>
							<div
								className={styles.imageContainer}
								onClick={handleClick}
							>
								<img
									className={styles.profile_avatar_img}
									src={store.user.avatarLink}
									alt="Avatar"
								/>
								<span className={styles.uploadText}>Загрузить</span>
								<input
									ref={fileInputRef}
									name="img"
									type="file"
									accept="image/*"
									onChange={handleImageChange}
									style={{ display: "none" }}
								/>
							</div>
							<h2>{store.user.username}</h2>
						</div>

						{/* <form onSubmit={handleFormSubmit}>
							<label htmlFor="imageUpload">
								Выберите изображение для загрузки:
							</label>
							<input
								name="img"
								type="file"
								accept="image/*"
								onChange={handleImageChange}
							/>
							<input
								style={{ cursor: "pointer" }}
								type="submit"
								value="Загрузить"
							/>
						</form> */}
					</div>
				</div>
			</div>
		);
	}
});
