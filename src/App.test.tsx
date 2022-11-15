import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import { App, ArtItem } from './App';
import {act} from "react-dom/test-utils";
import _ from "lodash";

test('has title', () => {
  render(<App />);
  const title = screen.getByText("Art Rater");
  expect(title).toBeInTheDocument();
});

test('for an art item, submit button is disabled until a rating is selected', async () => {
  render(<ArtItem id={27992} onRemove={_.noop}/>);
  await waitFor(() => expect(screen.getByTestId('artRatingScale')))

  const submitButton = screen.getByTestId('submitArtRating')
  expect(submitButton.hasAttribute('disabled')).toBeTruthy()
});

test('for an art item, clicking numbered button updates rating display below image to be that number', async () => {
  render(<ArtItem id={27992} onRemove={_.noop}/>)

  await waitFor(() => expect(screen.getByTestId('artRatingScale')))
  const ratingScale = screen.getByTestId('artRatingScale')

  // eslint-disable-next-line testing-library/no-node-access
  const thing: HTMLInputElement | null= ratingScale.querySelector("[value='4']")
  await act(() => thing?.click())

  expect(thing?.checked).toBeTruthy()
});

test('for an art item, clicking submit POSTs update, displays a toast success message, hides buttons', async () => {
  // The endpoint and payload for the submit button can be found in the submit method in `App.tsx`.
  // For the purpose of this test, please use a mock function instead.
  render(<ArtItem id={27992} onRemove={_.noop}/>)

  await waitFor(() => expect(screen.getByTestId('artRatingScale')))

  const ratingScale = screen.getByTestId('artRatingScale')

  // eslint-disable-next-line testing-library/no-node-access
  const thing: any = ratingScale.querySelector("[value='4']")
  await act(() => thing.click())

  const submitButton = screen.getByTestId('submitArtRating')

  global.fetch = jest.fn(() =>
    Promise.resolve({ok: true} as Response)
  )

  await act(() => submitButton.click())

  expect(screen.queryByTestId('submitArtRating')).toBeNull()
  expect(screen.queryByTestId('artRatingScale')).toBeNull()
  expect(fetch).toHaveBeenCalledTimes(1)
  expect(fetch).toHaveBeenCalledWith('https://20e2q.mocklab.io/rating', {
    method: "POST",
    body: JSON.stringify({
      id: 27992,
      rating: 4
    })
  })

});
