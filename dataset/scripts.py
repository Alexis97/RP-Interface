''' Some scripts for dataset '''
import os, glob, csv, shutil

def get_csv_list(img_dir, csv_path, root_dir = '', row = ['image_url']):
    ''' Generate Image List from a folder (as a csv format) '''

    # writing to csv file 
    with open(csv_path, 'w', newline='') as f: 
        # creating a csv writer object 
        writer = csv.writer(f, ) 
        writer.writerow(row)
            
        # writing the data rows 
        rows = [[root_dir + img_name] for img_name in os.listdir(img_dir)]
        print(rows)
        writer.writerows(rows)


def add_index(img_dir, new_img_dir, start_index = 0):
    ''' rename the images with index'''
    os.makedirs(new_img_dir, exist_ok=True)
    for i, img_name in enumerate(os.listdir(img_dir)):
        new_name = f'{start_index+i:03d}-{img_name}'
        shutil.copy(os.path.join(img_dir, img_name), os.path.join(new_img_dir, new_name))



if __name__ == "__main__":
    get_csv_list(
        img_dir = 'E:\Lab Work\Human Research\Dataset Collection\Iter-1', 
        csv_path = "E:\Lab Work\Human Research\Dataset Collection\Iter-1.csv",
        root_dir='https://sym-rp-data-collection.s3.amazonaws.com/Dataset/Iter-1/')
        
    # add_index(
    #     img_dir = 'E:\Lab Work\Human Research\Dataset\Iter-1', 
    #     new_img_dir = 'E:\Lab Work\Human Research\Dataset\Iter-1-rename', 
    #     start_index= 0)

