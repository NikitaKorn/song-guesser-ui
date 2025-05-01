import React from "react";
import {FindSong2} from './App';

const SongCard = ({ song }) => {
    return (
        <div className="song">
            <div>
                <p>{song.result.full_title}</p>
                <p>{song.result.url}</p>
                <button class="btn btn-default" onClick={() => FindSong2()} type="submit">find</button>
            </div>
        </div>
    );
}

export default SongCard