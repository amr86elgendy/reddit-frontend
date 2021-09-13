import { createRef, Fragment, useEffect, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router';
import useSWR from 'swr';
import PostCard from '../../components/PostCard';
import Sidebar from '../../components/Sidebar';
import classNames from 'classnames'
import { useAuthContext } from '../../context/auth';
import Axios from 'axios';

export default function Sub() {
  const [ownSub, setOwnSub] = useState(false)
  const { authenticated, user } = useAuthContext()

  const router = useRouter();
  const subName = router.query.sub;

  const fileInputRef = createRef()

  const { data: sub, error, revalidate } = useSWR(subName ? `/subs/${subName}` : null);
  
  useEffect(() => {
    if (!sub) return
    setOwnSub(authenticated && user.username === sub.user)
  }, [sub])

  const openFileInput = (type) => {
    if (!ownSub) return
    fileInputRef.current.name = type
    fileInputRef.current.click()
  }

  const uploadImage = async (event) => {
    const file = event.target.files[0]

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', fileInputRef.current.name)

    try {
      await Axios.post(`/subs/${sub.name}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      revalidate()
    } catch (err) {
      console.log(err)
    }
  }

  if (error) router.push('/');

  let postsMarkup;
  if (!sub) {
    postsMarkup = <p className='text-lg text-center'>Loading..</p>;
  } else if (sub.posts.length === 0) {
    postsMarkup = <p className='text-lg text-center'>No posts submitted yet</p>;
  } else {
    postsMarkup = sub.posts.map((post) => (
      <PostCard key={post._id} post={post} revalidate={revalidate} />
    ));
  }

  return (
    <div>
      <Head>
        <title>{sub?.title}</title>
      </Head>

      {sub && (
        <Fragment>
          <input
            type='file'
            hidden={true}
            ref={fileInputRef}
            onChange={uploadImage}
          />
          {/* Sub info and images */}
          <div>
            {/* Banner image */}
            <div
              className={classNames('bg-blue-500', {
                'cursor-pointer': ownSub,
              })}
              onClick={() => openFileInput('banner')}
            >
              {sub.bannerUrl ? (
                <div
                  className='h-56 bg-blue-500'
                  style={{
                    backgroundImage: `url(${sub.bannerUrl})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                ></div>
              ) : (
                <div className='h-20 bg-blue-500'></div>
              )}
            </div>
            {/* Sub meta data */}
            <div className='h-20 bg-white'>
              <div className='container relative flex'>
                <div className='absolute' style={{ top: -15 }}>
                  <Image
                    src={sub.imageUrl}
                    alt='Sub'
                    className={classNames('rounded-full', {
                      'cursor-pointer': ownSub,
                    })}
                    onClick={() => openFileInput('image')}
                    width={70}
                    height={70}
                  />
                </div>
                <div className='pt-1 pl-24'>
                  <div className='flex items-center'>
                    <h1 className='mb-1 text-3xl font-bold'>{sub.title}</h1>
                  </div>
                  <p className='text-sm font-bold text-gray-500'>
                    /r/{sub.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Posts & Sidebar */}
          <div className='container flex pt-5'>
            <div className='w-160'>{postsMarkup}</div>
            <Sidebar sub={sub} />
          </div>
        </Fragment>
      )}
    </div>
  );
}

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   try {
//     const res = await Axios.get('/posts')

//     return { props: { posts: res.data } }
//   } catch (err) {
//     return { props: { error: 'Something went wrong' } }
//   }
// }
