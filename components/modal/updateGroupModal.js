/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable consistent-return */
/* eslint-disable arrow-body-style */
import React, { useState, useCallback, useEffect } from 'react';

import { SketchPicker } from 'react-color';
import Cropper from 'react-easy-crop';

import {
  getFirestore, updateDoc, setDoc, doc,
} from 'firebase/firestore';

import { getAuth } from 'firebase/auth';

import {
  getStorage, ref, uploadBytes, getDownloadURL, deleteObject,
} from 'firebase/storage';

import styles from 'components/modal/styles.module.scss';
import Dropdown from 'components/dropdown';

import presetCategory from 'config/presetCategory';
import Input from 'components/input';
import LoadingButton from 'components/loadingButton';
import getCroppedImg from 'utils/image/cropImage';
import router from 'next/router';
import closeUpdateGroupModal from 'utils/modal/closeUpdateGroupModal';

const UpdateGroupModal = ({ groupData }) => {
  const [category, setCategory] = useState(groupData.category);
  const [groupName, setGroupName] = useState(groupData.groupName);
  const [groupSlogun, setGroupSlogun] = useState(groupData.groupSlogun);
  const [groupIntro, setGroupIntro] = useState(groupData.groupIntro);
  const [groupPageURL, setGroupPageURL] = useState(groupData.groupPageURL);

  const [tab, setTab] = useState(groupData.type);
  const [color, setColor] = useState(groupData.type === 'color' ? groupData.color : '#000000');
  const [image, setImage] = useState(groupData.type === 'image' ? groupData.imageURL : null);
  const [croppedImage, setCroppedImage] = useState(groupData.type === 'image' ? groupData.imageURL : null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (JSON.stringify(groupData) !== JSON.stringify({})) {
      setCategory(groupData.category);
      setGroupName(groupData.groupName);
      setGroupSlogun(groupData.groupSlogun);
      setGroupIntro(groupData.groupIntro);
      setGroupPageURL(groupData.groupPageURL);
      setTab(groupData.type);
      setColor(groupData.type === 'color' ? groupData.color : '#000000');
      setImage(groupData.type === 'image' ? groupData.imageURL : null);
      setCroppedImage(groupData.type === 'image' ? groupData.imageURL : null);
    }
  }, [groupData]);

  const handleImage = ({ target: { files } }) => {
    if (files.length === 1) {
      if (files[0].size >= 2 * 1024 * 1024) {
        return alert('2MB ????????? ???????????? ?????? ??? ??? ????????????');
      }
      setImage(URL.createObjectURL(files[0]));
      setCroppedImage(null);
    }
  };

  const onCropComplete = useCallback((croppedArea, _croppedAreaPixels) => {
    setCroppedAreaPixels(_croppedAreaPixels);
  }, []);

  const cropImage = async () => {
    const croppedResult = await getCroppedImg(image, croppedAreaPixels);
    setCroppedImage(croppedResult);
  };

  const updateGroup = async () => {
    if (!category) return alert('??????????????? ??????????????????');
    if (groupName.length < 2) return alert('?????? 2??? ????????? ?????? ????????? ??????????????????');
    if (groupSlogun.length < 2) return alert('?????? 2??? ????????? ?????? ???????????? ??????????????????');
    if (groupIntro.length < 2) return alert('?????? 2??? ????????? ?????? ????????? ??????????????????');
    if (tab === 'image' && croppedImage === null) return alert('???????????? ???????????????');

    const auth = getAuth();
    const db = getFirestore();
    const storage = getStorage();

    const { uid, displayName } = auth.currentUser;
    const groupRef = doc(db, 'groups', groupData.id);

    let imageURL = '';
    if (tab === 'image' && croppedImage !== groupData.imageURL) {
      const storageRef = ref(storage, `groups/${new Date().getTime()}.jpeg`);
      const croppedImageBlob = await fetch(croppedImage).then((r) => r.blob());
      let proms = [uploadBytes(storageRef, croppedImageBlob)];
      if (groupData.type === 'image') {
        const _beforeRef = groupData.imageURL.split('o/')[1].split('?alt')[0].replace('%2F', '/');
        proms = [...proms, deleteObject(ref(storage, _beforeRef))];
      }
      await Promise.all(proms);
      imageURL = await getDownloadURL(storageRef);
    }

    if (groupData.type === 'image' && tab === 'color') {
      const _beforeRef = groupData.imageURL.split('o/')[1].split('?alt')[0].replace('%2F', '/');
      await deleteObject(ref(storage, _beforeRef));
    }

    await updateDoc(groupRef, {
      owner: uid,
      created: new Date().getTime(),
      category,
      groupName,
      groupSlogun,
      groupIntro,
      groupPageURL,
      totalParticipants: 1,
      type: tab,
      color,
      imageURL: tab === 'image' && croppedImage !== groupData.imageURL ? imageURL : groupData.imageURL,
    });

    alert('???????????? ???????????????');
  };

  return (
    <div className={styles['modal-background-shadow']} id="update-group-modal">
      <div className={styles['modal-card-wrapper']}>
        <button type="button" onClick={closeUpdateGroupModal}>
          <img src="/icon/close.png" alt="close" className={styles.close} />
        </button>
        <div className={styles['modal-card-t2']}>
          <div className={styles.label}>?????? ????????????</div>
          <div className={styles['dropdown-wrapper']}>
            <Dropdown
              valueSets={presetCategory}
              placeholder="??????????????? ??????????????????"
              setter={setCategory}
              value={category}
            />
          </div>
          <div className={styles['input-wrapper']}>
            <Input
              placeholder="??????????????? ??????????????????"
              value={groupName}
              onChange={({ target: { value } }) => setGroupName(value)}
            />
          </div>
          <div className={styles['input-wrapper']}>
            <Input
              placeholder="???????????? ??????????????????"
              value={groupSlogun}
              onChange={({ target: { value } }) => setGroupSlogun(value)}
            />
          </div>
          <div className={styles['input-wrapper']}>
            <textarea
              placeholder="?????? ????????? ??????????????????"
              value={groupIntro}
              onChange={({ target: { value } }) => setGroupIntro(value)}
            />
          </div>
          <div className={styles['input-wrapper']}>
            <Input
              placeholder="???????????? ????????? ?????????????????? (????????????)"
              value={groupPageURL}
              onChange={({ target: { value } }) => setGroupPageURL(value)}
            />
          </div>
          <div className={styles['tab-wrapper']}>
            <button
              type="button"
              className={tab === 'color' ? styles.active : undefined}
              onClick={() => setTab('color')}
            >
              ??? ??????
            </button>
            <button
              type="button"
              className={tab === 'image' ? styles.active : undefined}
              onClick={() => setTab('image')}
            >
              ????????? ??????
            </button>
          </div>
          <input type="file" accept="image/*" id="file" onChange={handleImage} />
          {
            tab === 'color'
              ? <SketchPicker color={color} onChange={(c) => setColor(c.hex)} />
              : null
          }
          {
            tab === 'image' && image === null
              ? (
                <label htmlFor="file">
                  <div className={styles['image-add-btn']}>????????? ????????????</div>
                </label>
              )
              : null
          }
          {
            tab === 'image' && image !== null && croppedImage === null
              ? (
                <>
                  <div className={styles['image-crop-wrapper']}>
                    <Cropper
                      image={image}
                      aspect={1}
                      crop={crop}
                      onCropChange={setCrop}
                      zoom={zoom}
                      onZoomChange={setZoom}
                      cropShape="round"
                      onCropComplete={onCropComplete}
                    />
                  </div>
                  <button type="button" className={styles['image-cut-btn']} onClick={cropImage}>?????? ?????????</button>
                </>
              )
              : null
          }
          {
            tab === 'image' && image !== null && croppedImage !== null
              ? (
                <>
                  <div className={styles['image-crop-wrapper']}>
                    <div className={styles['cropped-image']} style={{ backgroundImage: `url(${croppedImage})` }} />
                  </div>
                  <label htmlFor="file">
                    <div className={styles['image-cut-btn']}>????????? ????????????</div>
                  </label>
                </>
              )
              : null
          }
          <div className={styles['submit-button-wrapper']}>
            <LoadingButton label="?????? ????????????" onClick={updateGroup} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateGroupModal;
