import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { changeProfile, updateUser, logout } from "../../redux/userSlice";
import { useNavigate } from "react-router-dom";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import app from "../../firebase.js";

const EditProfile = ({ setOpen }) => {
  const { currentUser } = useSelector((state) => state.user);

  const [img, setImg] = useState(null);
  const [bannerImg, setBannerImg] = useState(null); // New state for banner image
  const [imgUploadProgress, setImgUploadProgress] = useState(0);
  const [username, setUsername] = useState(currentUser.username);
  const [description, setDescription] = useState(currentUser.description);
  const [isUpdated, setIsUpdated] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const uploadImg = (file, type) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // ... (progress handling logic remains the same)
      },
      (error) => {
        console.error(error);
      },
      async () => {
        // Upload completed successfully, now get the download URL
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        try {
          const updateProfile = await axios.put(`/users/${currentUser._id}`, {
            [type]: downloadURL,
          });
          dispatch(changeProfile(downloadURL)); // Update Redux state for profile picture
          // Update usernaame in Redux state if needed (see explanation below)
        } catch (error) {
          console.error(error);
        }
      }
    );
  };
  const handleUpdateProfile = async () => {
    try {
      const updatedUser = await axios.put(`/users/${currentUser._id}`, {
        username,
        description,
      });
      dispatch(updateUser(updatedUser.data.username)); // Update Redux state for username
      
      console.log(updatedUser);
      setIsUpdated(true); // Set update flag
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    
    const deleteProfile = await axios.delete(`/users/${currentUser?._id}`);
    dispatch(logout());
    navigate("/signin");
    
  };
  useEffect(() => {
    if (username !== currentUser.username) { // Check for username change
      dispatch(updateUser(username)); // Dispatch update action
    }
  }, [username, currentUser.username, dispatch]); // Track username and currentUser.username

  useEffect(() => {
    img && uploadImg(img, "profilePicture"); // Upload profile picture
    bannerImg && uploadImg(bannerImg, "banner"); // Upload banner image
  }, [img, bannerImg,uploadImg]); // Listen for changes in img and bannerImg
  useEffect(() => {
    if (isUpdated) {
     
     
      setTimeout(() => setIsUpdated(false), 3000);
      console.log("Profile Updated!"); 
      // Reset update flag after a short delay
    }
  }, [isUpdated, setOpen]);
  return (
    <div className="absolute w-full h-full top-0 left-0 bg-transparent flex items-center justify-center">
      <div className="w-[600px] h-[600px] bg-slate-200 rounded-lg p-8 flex flex-col gap-4 relative">
        <button
          onClick={() =>{
             setOpen(false);
             setIsUpdated(false);}}
          className="absolute top-3 right-3 cursor-pointer"
        >
          X
        </button>
        <h2 className="font-bold text-xl">Edit Profile</h2>
        {isUpdated && <p className="text-blue-500 font-bold">Profile Updated!</p>}
        <p>Choose a new profile picture</p>
        {imgUploadProgress > 0 ? (
          "Uploading " + imgUploadProgress + "%"
        ) : (
          <input
            type="file"
            className="bg-transparent border border-slate-500 rounded p-2"
            accept="image/*"
            onChange={(e) => setImg(e.target.files[0])}
          />
        )}

        <p>Choose a new banner image</p>
        {imgUploadProgress > 0 ? (
          "Uploading " + imgUploadProgress + "%"
        ) : (
          <input
            type="file"
            className="bg-transparent border border-slate-500 rounded p-2"
            accept="image/*"
            onChange={(e) => setBannerImg(e.target.files[0])}
          />
        )}

        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          value={currentUser.username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label htmlFor="description">Bio:</label>
        <textarea
          id="description"
          value={currentUser.description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>

        <button
          className="bg-blue-500 text-white py-2 rounded-full"
          onClick={handleUpdateProfile}
        >
          Update Profile
        </button>

        <p>Delete Account</p>
        <button
          className="bg-red-500 text-white py-2 rounded-full"
          onClick={handleDelete}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default EditProfile;