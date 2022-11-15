import React, {useEffect, useState} from 'react';
import './App.css';
import {Button, Card, CircularProgress, Input, Rating, Tooltip} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import {ImageSearch} from "@mui/icons-material";
import _ from "lodash";
import {toast, Toaster} from "react-hot-toast";

async function getArtwork(id: number) {
    return fetch('https://api.artic.edu/api/v1/artworks/' + id);
}

function getImageUrl(id: string) {
    return 'https://www.artic.edu/iiif/2/' + id + '/full/843,/0/default.jpg'
}

function ArtItem({id, onRemove}: { id: number, onRemove: (id: number) => void }) {
    const [artwork, setArtwork] = useState<any>(null)
    const [error, setError] = useState<boolean>(false)
    const [rating, setRating] = useState<number | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [submitted, setSubmitted] = useState<boolean>(false)

    const submit = () => {
        fetch('https://20e2q.mocklab.io/rating', {
            method: "POST",
            body: JSON.stringify({
                id,
                rating
            })
        }).then(r => {
            if (r.ok) {
                toast(`Submitted review for ${artwork?.data.title}`)
                setSubmitted(true)
            } else {
                toast("ERROR: server error on review submission :<",)
            }
        })
    };

    useEffect(() => {
        getArtwork(id).then(async (r) => {
            if (r.ok) {
                const json = await r.json()
                setArtwork(json)
            } else {
                setError(true)
            }
        }).finally(() => {
            setLoading(false)
        })
    }, [id]);

    let CardBody;

    if (error) {
        CardBody = <>
            <Tooltip onClick={() => onRemove(id)} style={{float: 'right', alignSelf: "end"}} title="Remove Artwork">
                <CloseIcon/>
            </Tooltip>

            <div className="errorCardBody">
                    <h2>There was an error!</h2>
                    <p>There was an error loading this image, try checking the ID...</p>
            </div>
        </>
    } else if (loading) {
        CardBody = (<CircularProgress style={{marginTop: "34%"}}/>)
    } else {
        CardBody = (<>
            <img
                src={artwork != null ? getImageUrl(artwork?.data?.image_id) : ""}/>

            <div className="artCardContent">
                <div className="artInfo">
                    <Tooltip onClick={() => onRemove(id)} style={{float: 'right', alignSelf: "end"}}
                             title="Remove Artwork">
                        <CloseIcon/>
                    </Tooltip>

                    <h2>{artwork?.data.title}</h2>
                    <h3>{artwork?.data.artist_title}</h3>
                </div>

                <div className="ratingFormStars">
                    {!submitted && (<>
                        <Rating data-testid="artRatingScale" onChange={(event, value) =>
                            setRating(value)
                        }></Rating>
                        <Button data-testid="submitArtRating" disabled={rating === null}
                                onClick={submit}>Submit</Button>
                    </>)}
                </div>

            </div>

        </>)
    }

    return (
        <Card className="artCard">
            {CardBody}
        </Card>
    )
}

function AddArtItem({onSubmit}: any) {
    const [imageId, setImageId] = useState<string>("")

    const submit = () => {
        if (!imageId.length) return

        onSubmit(imageId)
        setImageId("")
    }


    return (
        <Card className="artCard">
            <div className="newArtCard">
                <h3>Add Artwork!</h3>
                <ImageSearch className="imageSearchIcon"/>
                <Input type="number" value={imageId} onChange={(event) => setImageId(event.target.value)}
                       placeholder="Enter artID here!"></Input>
                <Button onClick={submit}>Submit!</Button>
            </div>
        </Card>)

}

function App() {
    const [artworkIds, setArtworkIds] = useState([
        27992,
        27998,
        27999,
        27997,
        27993,
        27994,
    ]);

    const removeArt = (id: number) => {
        setArtworkIds(artworkIds => _.without(artworkIds, id))
        toast(`Removed artwork ${id}`)
    }

    return (
        <div className="App">
            <div><Toaster/></div>

            <h1 className="websiteTitle">Art Rater</h1>
            <h2 className="websiteTitle">Real Artwork, Your Thoughts, Nobody Listening</h2>

            <div className="artContainer">
                <AddArtItem onSubmit={(id: string) => {
                    setArtworkIds(artworkIds => [Number(id), ...artworkIds])
                }}></AddArtItem>

                {artworkIds.map(id => <ArtItem key={id} id={id} onRemove={removeArt}/>)}
            </div>
        </div>
    );
}

export {App, ArtItem};
